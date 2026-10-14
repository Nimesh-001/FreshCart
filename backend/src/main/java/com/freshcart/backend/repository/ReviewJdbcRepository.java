package com.freshcart.backend.repository;

import com.freshcart.backend.dto.review.ProductReviewAnalysisResponse;
import com.freshcart.backend.dto.review.ReviewResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.List;
import java.util.Optional;

@Repository
public class ReviewJdbcRepository implements ReviewRepository {

    private final JdbcTemplate jdbcTemplate;

    private SimpleJdbcCall reviewAddCall;
    private SimpleJdbcCall reviewUpdateCall;

    private static final RowMapper<ReviewResponse> REVIEW_ROW_MAPPER = (rs, rowNum) -> {
        ReviewResponse r = new ReviewResponse();
        r.setReviewId(rs.getInt("review_id"));
        r.setCustomerId(rs.getInt("customer_id"));
        r.setCustomerName(rs.getString("customer_name"));
        r.setProductId(rs.getInt("product_id"));
        r.setProductName(rs.getString("product_name"));
        r.setOrderId(rs.getInt("order_id"));
        r.setRating(rs.getInt("rating"));
        r.setRatingLabel(rs.getString("rating_label"));
        r.setComment(rs.getString("comment"));
        r.setCreatedAt(rs.getTimestamp("created_at"));
        return r;
    };

    private static final RowMapper<ProductReviewAnalysisResponse> ANALYSIS_ROW_MAPPER = (rs, rowNum) -> {
        ProductReviewAnalysisResponse a = new ProductReviewAnalysisResponse();
        a.setProductId(rs.getInt("product_id"));
        a.setProductName(rs.getString("product_name"));
        a.setCategoryName(rs.getString("category_name"));
        a.setTotalReviews(rs.getLong("total_reviews"));
        a.setAverageRating(rs.getBigDecimal("average_rating"));
        a.setPositiveReviews(rs.getLong("positive_reviews"));
        a.setAverageReviews(rs.getLong("average_reviews"));
        a.setNegativeReviews(rs.getLong("negative_reviews"));
        a.setOverallRatingLabel(rs.getString("overall_rating_label"));
        return a;
    };

    public ReviewJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        this.reviewAddCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_review_add")
                .declareParameters(
                        new SqlParameter("p_customer_id", Types.INTEGER),
                        new SqlParameter("p_product_id", Types.INTEGER),
                        new SqlParameter("p_order_id", Types.INTEGER),
                        new SqlParameter("p_rating", Types.TINYINT),
                        new SqlParameter("p_comment", Types.VARCHAR)
                );

        this.reviewUpdateCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_review_update")
                .declareParameters(
                        new SqlParameter("p_review_id", Types.INTEGER),
                        new SqlParameter("p_customer_id", Types.INTEGER),
                        new SqlParameter("p_rating", Types.TINYINT),
                        new SqlParameter("p_comment", Types.VARCHAR)
                );
    }

    @Override
    public void addReview(Integer customerId, Integer productId, Integer orderId, Integer rating, String comment) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_customer_id", customerId)
                .addValue("p_product_id", productId)
                .addValue("p_order_id", orderId)
                .addValue("p_rating", rating)
                .addValue("p_comment", comment);

        reviewAddCall.execute(inParams);
    }

    @Override
    public void updateReview(Integer reviewId, Integer customerId, Integer rating, String comment) {
        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_review_id", reviewId)
                .addValue("p_customer_id", customerId)
                .addValue("p_rating", rating)
                .addValue("p_comment", comment);

        reviewUpdateCall.execute(inParams);
    }

    @Override
    public List<ProductReviewAnalysisResponse> getReviewAnalysis(Integer productId) {
        return jdbcTemplate.query("CALL sp_review_analysis(?)", ANALYSIS_ROW_MAPPER, productId);
    }

    @Override
    public Optional<ReviewResponse> findReviewById(Integer reviewId) {
        String sql = "SELECT r.review_id, r.customer_id, fn_customer_full_name(c.first_name, c.last_name) AS customer_name, " +
                     "r.product_id, p.product_name, r.order_id, r.rating, fn_review_rating_label(r.rating) AS rating_label, " +
                     "r.comment, r.created_at " +
                     "FROM reviews r " +
                     "JOIN customers c ON r.customer_id = c.customer_id " +
                     "JOIN products p ON r.product_id = p.product_id " +
                     "WHERE r.review_id = ?";

        try {
            ReviewResponse review = jdbcTemplate.queryForObject(sql, REVIEW_ROW_MAPPER, reviewId);
            return Optional.ofNullable(review);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<ReviewResponse> findReviewsByProductId(Integer productId) {
        String sql = "SELECT r.review_id, r.customer_id, fn_customer_full_name(c.first_name, c.last_name) AS customer_name, " +
                     "r.product_id, p.product_name, r.order_id, r.rating, fn_review_rating_label(r.rating) AS rating_label, " +
                     "r.comment, r.created_at " +
                     "FROM reviews r " +
                     "JOIN customers c ON r.customer_id = c.customer_id " +
                     "JOIN products p ON r.product_id = p.product_id " +
                     "WHERE r.product_id = ? " +
                     "ORDER BY r.created_at DESC";

        return jdbcTemplate.query(sql, REVIEW_ROW_MAPPER, productId);
    }

    @Override
    public Optional<ReviewResponse> findReviewByCustomerProductOrder(Integer customerId, Integer productId, Integer orderId) {
        String sql = "SELECT r.review_id, r.customer_id, fn_customer_full_name(c.first_name, c.last_name) AS customer_name, " +
                     "r.product_id, p.product_name, r.order_id, r.rating, fn_review_rating_label(r.rating) AS rating_label, " +
                     "r.comment, r.created_at " +
                     "FROM reviews r " +
                     "JOIN customers c ON r.customer_id = c.customer_id " +
                     "JOIN products p ON r.product_id = p.product_id " +
                     "WHERE r.customer_id = ? AND r.product_id = ? AND r.order_id = ?";

        try {
            ReviewResponse review = jdbcTemplate.queryForObject(sql, REVIEW_ROW_MAPPER, customerId, productId, orderId);
            return Optional.ofNullable(review);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public String getRatingLabel(Integer rating) {
        String sql = "SELECT fn_review_rating_label(?)";
        return jdbcTemplate.queryForObject(sql, String.class, rating);
    }
}
