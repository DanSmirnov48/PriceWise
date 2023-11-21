"use client";
import { addProductReviewSummary } from "@/lib/actions";
import { useCompletion } from "ai/react";
import React, { useEffect, useState } from "react";

type Props = {
  productId: string;
  productReviews: string | string[];
};

const initialData = {
  positives: [],
  negatives: [],
};

interface RawData {
  positives: string;
  negatives: string;
}

function Reviews({ productId, productReviews }: Props) {

  const [data, setData] = useState(initialData);
  const [dataLoaded, setDataLoaded] = useState<boolean>();
  const [rawData, setRawData] = useState<RawData>({positives: "", negatives: ""});

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/generate",
    onFinish: async (_prompt, completion) => {
      // console.log(completion)

      try {
        let res = JSON.parse(completion);
        setData(res);
        setDataLoaded(true);
        await addProductReviewSummary(productId, completion);
      } catch (error) {
        setDataLoaded(false);

        const negativesIndex = completion.indexOf("Negatives:");
        const positives = completion.substr(0, negativesIndex).trim();
        const negatives = completion.substr(negativesIndex).trim();
        setRawData((prevData) => ({ ...prevData, positives }));
        setRawData((prevData) => ({ ...prevData, negatives }));

        console.log(error);
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });

  useEffect(() => {
    if (typeof productReviews === "string") {
      //Product has reviewSummary
      // console.log(JSON.parse(productReviews))
      setData(JSON.parse(productReviews));
    } else {
      //Product does not have reviewSummary
      // console.log(productReviews)
      complete(JSON.stringify(productReviews));
    }
  }, []);

  function placeholder() {
    return (
      <div className="w-full mx-auto">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-4">
                <div className="h-10 bg-slate-300 rounded col-span-1" />
                <div className="h-10 bg-slate-200 rounded col-span-2" />
                <div className="h-10 bg-slate-300 rounded col-span-1" />
                <div className="h-10 bg-slate-200 rounded col-span-2" />
                <div className="h-10 bg-slate-300 rounded col-span-1" />

                <div className="h-10 bg-slate-200 rounded col-span-1" />
                <div className="h-10 bg-slate-300 rounded col-span-1" />
                <div className="h-10 bg-slate-200 rounded col-span-3" />
                <div className="h-10 bg-slate-200 rounded col-span-1" />
                <div className="h-10 bg-slate-200 rounded col-span-2" />

                <div className="h-10 bg-slate-300 rounded col-span-1" />
                <div className="h-10 bg-slate-200 rounded col-span-2" />
                <div className="h-10 bg-slate-300 rounded col-span-1" />
                <div className="h-10 bg-slate-200 rounded col-span-1" />
                <div className="h-10 bg-slate-200 rounded col-span-1" />
                <div className="h-10 bg-slate-300 rounded col-span-3" />
                <div className="h-10 bg-slate-200 rounded col-span-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function error() {
    return (
      <>
        <div className="bg-red-100 p-4 pb-10 rounded-xl space-x-2 border border-gray-300 px-7 py-4 shadow-lg">
          <h1 className="text-lg font-semibold text-center justify-center py-3">
            Failed to process the reviews fully!
          </h1>
          <p>{rawData.positives}</p>
          <br />
          <p>{rawData.negatives}</p>
        </div>
      </>
    );
  }

  function content() {
    return (
      <>
        {[...data.positives, ...data.negatives].map((item, index) => (
          <div
            key={index}
            className={`rounded-md flex flex-grow p-4 m-1 h-10 items-center justify-center ${
              data.positives.includes(item) ? "bg-green-200" : "bg-red-200"
            }`}
          >
            <span className="font-sm">{item}</span>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <div className="w-full max-w-full">
        <div className="flex flex-wrap sm:mx-auto sm:mb-2 -mx-2 py-4 text-base">
          {isLoading
            ? placeholder()
            : dataLoaded === false
            ? error()
            : content()}
        </div>
      </div>
    </>
  );
}

export default Reviews;
