package com.freshcart.backend.service;

import com.freshcart.backend.dto.order.OrderResponse;
import com.freshcart.backend.dto.product.ProductResponse;
import com.freshcart.backend.dto.review.AddReviewRequest;
import com.freshcart.backend.dto.review.ProductReviewAnalysisResponse;
import com.freshcart.backend.dto.review.ReviewResponse;
import com.freshcart.backend.dto.review.UpdateReviewRequest;
import com.freshcart.backend.exception.DuplicateResourceException;
import com.freshcart.backend.exception.ResourceNotFoundException;
import com.freshcart.backend.repository.CustomerRepository;
import com.freshcart.backend.repository.OrderRepository;
import com.freshcart.backend.repository.ProductRepository;
import com.freshcart.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    private final ConcurrentHashMap<String, Object> reviewLocks = new ConcurrentHashMap<>();

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             CustomerRepository customerRepository,
                             ProductRepository productRepository,
                             OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    private Object getReviewLock(Integer customerId, Integer productId, Integer orderId) {
        String key = customerId + "-" + productId + "-" + orderId;
        return reviewLocks.computeIfAbsent(key, k -> new Object());
    }

    @Override
    public ReviewResponse addReview(AddReviewRequest request) {
        Integer customerId = request.getCustomerId();
        Integer productId = request.getProductId();
        Integer orderId = request.getOrderId();
        Integer rating = request.getRating();
        String comment = request.getComment();

        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        ProductResponse product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new IllegalArgumentException("Cannot review an inactive product: " + product.getProductName());
        }

        OrderResponse order = orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getCustomerId().equals(customerId)) {
            throw new IllegalArgumentException("Order #" + orderId + " does not belong to customer #" + customerId);
        }

        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalArgumentException("A delivered order belonging to this customer is required. Current order status: " + order.getStatus());
        }

        boolean productInOrder = order.getItems() != null && order.getItems().stream()
                .anyMatch(item -> item.getProductId().equals(productId));
        if (!productInOrder) {
            throw new IllegalArgumentException("This product was not found in the specified order #" + orderId);
        }

        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        synchronized (getReviewLock(customerId, productId, orderId)) {
            if (reviewRepository.findReviewByCustomerProductOrder(customerId, productId, orderId).isPresent()) {
                throw new DuplicateResourceException("A review has already been submitted for this product in order #" + orderId);
            }

            reviewRepository.addReview(customerId, productId, orderId, rating, comment);
        }

        return reviewRepository.findReviewByCustomerProductOrder(customerId, productId, orderId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve created review"));
    }

    @Override
    public ReviewResponse updateReview(Integer reviewId, UpdateReviewRequest request) {
        ReviewResponse existingReview = reviewRepository.findReviewById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        Integer effectiveCustomerId = request.getCustomerId() != null
                ? request.getCustomerId()
                : existingReview.getCustomerId();

        if (!existingReview.getCustomerId().equals(effectiveCustomerId)) {
            throw new IllegalArgumentException("Review not found or you are not its owner");
        }

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        synchronized (getReviewLock(existingReview.getCustomerId(), existingReview.getProductId(), existingReview.getOrderId())) {
            reviewRepository.updateReview(reviewId, effectiveCustomerId, request.getRating(), request.getComment());
        }

        return reviewRepository.findReviewById(reviewId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve updated review"));
    }

    @Override
    public List<ProductReviewAnalysisResponse> getReviewAnalysis(Integer productId) {
        if (productId != null && !productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        return reviewRepository.getReviewAnalysis(productId);
    }

    @Override
    public ReviewResponse getReviewById(Integer reviewId) {
        return reviewRepository.findReviewById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));
    }

    @Override
    public List<ReviewResponse> getReviewsByProductId(Integer productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        return reviewRepository.findReviewsByProductId(productId);
    }
}
