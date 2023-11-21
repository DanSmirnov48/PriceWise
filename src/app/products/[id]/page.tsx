import {
  getProductById,
  getSimilarProducts,
} from "@/lib/actions";
import { Product, Review } from "@/types";
import { redirect } from "next/navigation";
import React from "react";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { extractAndConvertToInteger, formatNumber } from "@/lib/utils";
import Link from "next/link";
import PriceInfoCard from "@/components/PriceInfoCard";
import Modal from "@/components/Model";
import Reviews from "@/components/Reviews";
import { Rating, Star } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: { id: string } };

const ProductDetails = async ({ params: { id } }: Props) => {
  const product: Product = await getProductById(id);

  if (!product) redirect("/");
  const similarProducts = await getSimilarProducts(id);

  const ratingStyle = {
    itemShapes: Star,
    activeFillColor: "#ffb700",
    inactiveFillColor: "#fbf1a9",
  };

  function isStringEmpty(str: string) {
    return str === null || str === undefined || str === "";
  }

  // const reviews = await getProductReviews(id);
  const reviewTexts: string[] = product.reviews!.map(
    (review: Review) => review.text.slice(0, 300)
  );

  return (
    <div className="product-container">
      <div className="flex gap-28 xl:flex-row flex-col">
        <div className="product-image">
          <Image
            src={product.image}
            alt={product.title}
            width={580}
            height={400}
            className="mx-auto"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-5 flex-wrap pb-6">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] text-secondary font-semibold">
                {product.title}
              </p>

              <Link
                href={product.url}
                target="_blank"
                className="text-base text-black opacity-50"
              >
                Visit Product
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="product-hearts">
                <Image
                  src="/assets/icons/red-heart.svg"
                  alt="heart"
                  width={20}
                  height={20}
                />

                <p className="text-base font-semibold text-[#D46F77]">
                  {product.reviewsCount}
                </p>
              </div>

              <div className="p-2 bg-white-200 rounded-10">
                <Image
                  src="/assets/icons/bookmark.svg"
                  alt="bookmark"
                  width={20}
                  height={20}
                />
              </div>

              <div className="p-2 bg-white-200 rounded-10">
                <Image
                  src="/assets/icons/share.svg"
                  alt="share"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>

          <div className="product-info">
            <div className="flex flex-col gap-2">
              <p className="text-[34px] text-secondary font-bold">
                {product.currency} {formatNumber(product.currentPrice)}
              </p>
              <p className="text-[21px] text-black opacity-50 line-through">
                {product.currency} {formatNumber(product.originalPrice)}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="product-stars">
                  <Image
                    src="/assets/icons/star.svg"
                    alt="star"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-primary-orange font-semibold">
                    {product.stars || "25"}
                  </p>
                </div>

                <div className="product-reviews">
                  <Image
                    src="/assets/icons/comment.svg"
                    alt="comment"
                    width={16}
                    height={16}
                  />
                  <p className="text-sm text-secondary font-semibold">
                    {product.reviewsCount} Reviews
                  </p>
                </div>
              </div>

              <p className="text-sm text-black opacity-50">
                <span className="text-primary-green font-semibold">93% </span>{" "}
                of buyers have recommeded this.
              </p>
            </div>
          </div>

          <div className="my-7 flex flex-col gap-5">
            <div className="flex gap-5 flex-wrap">
              <PriceInfoCard
                title="Current Price"
                iconSrc="/assets/icons/price-tag.svg"
                value={`${product.currency} ${formatNumber(
                  product.currentPrice
                )}`}
              />
              <PriceInfoCard
                title="Average Price"
                iconSrc="/assets/icons/chart.svg"
                value={`${product.currency} ${formatNumber(
                  product.averagePrice
                )}`}
              />
              <PriceInfoCard
                title="Highest Price"
                iconSrc="/assets/icons/arrow-up.svg"
                value={`${product.currency} ${formatNumber(
                  product.highestPrice
                )}`}
              />
              <PriceInfoCard
                title="Lowest Price"
                iconSrc="/assets/icons/arrow-down.svg"
                value={`${product.currency} ${formatNumber(
                  product.lowestPrice
                )}`}
              />
            </div>
          </div>

          <Modal productId={id} />
        </div>
      </div>

      <div className="">
        <h3 className="text-2xl text-secondary font-semibold my-4 text-center">
          Product Reviews
        </h3>

        {isStringEmpty(product.reviewSummary) ? (
          //will be passed as a string array
          <Reviews
            productId={product._id!.toString()}
            productReviews={reviewTexts}
          />
        ) : (
          //will be passed as a string
          <Reviews
            productId={product._id!.toString()}
            productReviews={product.reviewSummary}
          />
        )}

        <div className="flex flex-col gap-2">
          {product?.reviews?.map((review, index) => (
            <div key={index} className="mx-auto mb-4 w-full space-x-2 overflow-hidden rounded-lg border border-gray-200 bg-white px-7 py-4 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
              <div className="flex gap-3 justify-start mb-2">
                <h1 className="text-lg font-semibold text-gray-700 ml-2">
                  {review.title.slice(18, review.title.length)}
                </h1>
                <Rating
                  value={extractAndConvertToInteger(review.rating)!}
                  readOnly
                  itemStyles={ratingStyle}
                  style={{ maxWidth: 120 }}
                />
              </div>
              <p className="text-base text-gray-700">{review.text}</p>
            </div>
          ))}
        </div>
      </div>

      {similarProducts && similarProducts?.length > 0 && (
        <div className="py-14 flex flex-col gap-2 w-full">
          <p className="section-text">Similar Products</p>

          <div className="flex flex-wrap gap-10 mt-7 w-full">
            {similarProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
