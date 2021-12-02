const db = require("../db/connection");

exports.fetchReview = (id) => {
  return db
    .query(
      `SELECT title, review_body, designer, review_img_url, reviews.votes, 
      category, owner, reviews.created_at, reviews.review_id, 
      COUNT(comments.review_id) 
      AS comment_count 
      FROM reviews 
      LEFT JOIN comments 
      ON comments.review_id = reviews.review_id
      WHERE reviews.review_id = $1
      GROUP BY reviews.review_id;`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No review found at review_id: ${id}`,
        });
      }
      return rows;
    });
};

exports.updateReview = (id, update) => {
  if (
    !update.inc_votes ||
    typeof update.inc_votes === "string" ||
    Object.keys(update).length > 1
  ) {
    return Promise.reject({
      code: "22P02",
    });
  }
  return db
    .query(
      `UPDATE reviews
  SET votes = votes + $1
  WHERE review_id = $2
  RETURNING *;`,
      [update.inc_votes, id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No review found at review_id: ${id}`,
        });
      }
      return rows;
    });
};

exports.fetchAllReviews = (sort) => {
  return db
    .query(
      `SELECT title, owner, reviews.review_id, review_img_url, review_body, category, reviews.created_at, reviews.votes, 
  COUNT(comments.review_id)
  AS comment_count
  FROM reviews
  LEFT JOIN comments
  ON comments.review_id = reviews.review_id
  GROUP BY reviews.review_id`
    )
    .then(({ rows }) => {
      return rows;
    });
};