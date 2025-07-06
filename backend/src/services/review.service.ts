// type declaration
import { ReviewModel } from "../model/review.model";
import {
  InvalidMovieReviewPayload,
  ReviewNotFound,
} from "../utils/movie-review-errors";

type TReviews = {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  comments: string;
};

// create review

async function createReview(input: Omit<TReviews, "id">) {
  const review = new ReviewModel({
    userId: input.userId,
    movieId: input.movieId,
    rating: input.rating,
    comments: input.comments,
  });
  await review.save();
  return review;
}

//update the review

async function updateReview(
  toUpdateReviewId: string,
  input: Omit<TReviews, "id" | "movieId" | "userId">
) {
  const review = await ReviewModel.findById(toUpdateReviewId);

  if (!review) {
    throw new Error("Review not found!");
  }

  review.rating = input.rating;
  review.comments = input.comments;
  await review.save();
  return review;
}

// get all reviews

async function getAllReviews() {
  const reviews = await ReviewModel.find();
  return reviews;
}

// get by id review
async function getReviewById(toGetReviewId: string) {
  const review = await ReviewModel.findById(toGetReviewId);
  if (!review) {
    throw new ReviewNotFound();
  }
  return review;
}

// get by id review by movieId

async function getReviewByMovieId(movieId: string) {
  const reviews = await ReviewModel.find({ movieId });
  return reviews;
}

// delete review

async function deleteReview(toDeleteReviewId: string) {
  const review = await ReviewModel.findById(toDeleteReviewId);
  if (!review) {
    throw new InvalidMovieReviewPayload("Review not found to delete");
  }
  await ReviewModel.deleteOne({
    _id: toDeleteReviewId,
  });

  return review;
}

export const reviewServices = {
  createReview,
  updateReview,
  getAllReviews,
  getReviewByMovieId,
  deleteReview,
  getReviewById,
};
