package com.freshcart.backend.exception;

import com.freshcart.backend.common.ApiResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateResource(DuplicateResourceException ex) {
        log.warn("Duplicate resource: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateKey(DuplicateKeyException ex) {
        log.warn("Duplicate database key violation: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("A record with the provided unique information (username, email, or phone) already exists."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed", errors));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String propertyPath = violation.getPropertyPath().toString();
            errors.put(propertyPath, violation.getMessage());
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed", errors));
    }

    @ExceptionHandler({DataAccessException.class, SQLException.class})
    public ResponseEntity<ApiResponse<Void>> handleDatabaseException(Exception ex) {
        String message = ex.getMessage();
        log.error("Database operation failed: {}", message, ex);

        if (message != null && (message.contains("Customer does not exist") || message.contains("Customer not found") || message.contains("Product not found") || message.contains("Category not found") || message.contains("Supplier not found") || message.contains("Product-supplier link not found") || message.contains("Inventory record not found") || message.contains("Active cart not found") || message.contains("Product is not in the cart") || message.contains("Order not found for this customer") || message.contains("Order not found") || message.contains("Payment record not found") || message.contains("Delivery record not found") || message.contains("Tracking record not found") || message.contains("Review not found") || message.contains("Purchase summary not found"))) {
            String errorMsg = "Resource not found.";
            if (message.contains("Customer does not exist") || message.contains("Customer not found")) errorMsg = "Customer not found.";
            else if (message.contains("Product not found")) errorMsg = "Product not found.";
            else if (message.contains("Category not found")) errorMsg = "Category not found.";
            else if (message.contains("Supplier not found")) errorMsg = "Supplier not found or inactive.";
            else if (message.contains("Product-supplier link not found")) errorMsg = "Product-supplier link not found.";
            else if (message.contains("Inventory record not found")) errorMsg = "Inventory record not found.";
            else if (message.contains("Active cart not found")) errorMsg = "Active cart not found.";
            else if (message.contains("Product is not in the cart")) errorMsg = "Product is not in the cart.";
            else if (message.contains("Payment record not found")) errorMsg = "Payment record not found.";
            else if (message.contains("Delivery record not found")) errorMsg = "Delivery record not found.";
            else if (message.contains("Tracking record not found")) errorMsg = "Tracking record not found.";
            else if (message.contains("Review not found")) errorMsg = "Review not found.";
            else if (message.contains("Purchase summary not found")) errorMsg = "Purchase summary not found.";
            else if (message.contains("Order not found")) errorMsg = "Order not found.";
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(errorMsg));
        }

        if (message != null && (message.contains("Active product not found") || message.contains("Active supplier not found"))) {
            String errorMsg = message.contains("Active product") ? "Active product not found." : "Active supplier not found.";
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(errorMsg));
        }

        if (message != null && message.contains("Category does not exist or is inactive")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Category does not exist or is inactive."));
        }

        if (message != null && (message.contains("Price, reorder level and stock must be non-negative") || message.contains("Price and reorder level must be non-negative"))) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Price, reorder level, and stock quantity must be non-negative."));
        }

        if (message != null && message.contains("Supplier price must be non-negative")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Supplier price must be non-negative."));
        }

        if (message != null && message.contains("Received quantity must be greater than zero")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Received quantity must be greater than zero."));
        }

        if (message != null && message.contains("Quantity change cannot be zero")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Quantity change cannot be zero."));
        }

        if (message != null && message.contains("Adjustment reason is required")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Adjustment reason is required."));
        }

        if (message != null && message.contains("Adjustment would make stock negative")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Adjustment would cause stock to fall below zero."));
        }

        if (message != null && message.contains("Supplier name is required")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Supplier name is required."));
        }

        if (message != null && message.contains("Action must be ADD, UPDATE or REMOVE")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Action must be ADD, UPDATE or REMOVE."));
        }

        if (message != null && message.contains("Category name is required")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Category name is required."));
        }

        if (message != null && message.contains("Invalid category action")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid category action specified. Must be ADD, UPDATE, or DEACTIVATE."));
        }

        if (message != null && message.contains("Address does not belong to this customer")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("The specified address does not belong to this customer."));
        }

        if (message != null && (message.contains("Cart quantity exceeds available stock") || message.contains("Requested quantity exceeds available stock"))) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Requested quantity exceeds available inventory stock."));
        }

        if (message != null && message.contains("Quantity must be greater than zero")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Quantity must be greater than zero."));
        }

        if (message != null && message.contains("Quantity cannot be negative")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Quantity cannot be negative."));
        }

        if (message != null && message.contains("Cannot checkout an empty cart")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Cannot checkout an empty cart."));
        }

        if (message != null && message.contains("Cart contains inactive products")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Cart contains inactive products that cannot be purchased."));
        }

        if (message != null && (message.contains("Insufficient stock to complete checkout") || message.contains("Inventory record missing for a cart product"))) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Insufficient inventory stock to complete checkout."));
        }

        if (message != null && message.contains("Only pending orders can be cancelled")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Only pending orders can be cancelled."));
        }

        if (message != null && message.contains("A payment record already exists for this order")) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("A payment record already exists for this order."));
        }

        if (message != null && (message.contains("Invalid payment method") || message.contains("Payment amount does not match order total"))) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(message.contains("Invalid payment method") ? "Invalid payment method." : "Payment amount does not match order total."));
        }

        if (message != null && message.contains("Only successful payments can be refunded")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Only successful payments can be refunded."));
        }

        if (message != null && message.contains("Only paid or processing orders can be assigned")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Only paid or processing orders can be assigned."));
        }

        if (message != null && message.contains("Delivered orders cannot be reopened here")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Delivered orders cannot be reopened here."));
        }

        if (message != null && message.contains("Invalid delivery status")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid delivery status specified."));
        }

        if (message != null && message.contains("A verified transaction reference is required")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("A verified transaction reference is required."));
        }

        if (message != null && message.contains("Order is not eligible for payment")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Order is not eligible for payment."));
        }

        if (message != null && message.contains("Payment amount must be non-negative")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Payment amount must be non-negative."));
        }

        if (message != null && message.contains("Delivery person name is required")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Delivery person name is required."));
        }

        if (message != null && message.contains("Delivery phone is required")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Delivery phone is required."));
        }

        if (message != null && message.contains("Rating must be between 1 and 5")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Rating must be between 1 and 5."));
        }

        if (message != null && message.contains("A delivered order belonging to this customer is required")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("A delivered order belonging to this customer is required."));
        }

        if (message != null && message.contains("This product was not found in the specified order")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("This product was not found in the specified order."));
        }

        if (message != null && message.contains("Review not found or you are not its owner")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Review not found or you are not its owner."));
        }

        if (message != null && message.contains("Please provide a valid date range")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Please provide a valid date range."));
        }


        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("A database error occurred while processing your request. Please try again later."));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        log.warn("Malformed HTTP request body: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Malformed request payload or invalid data format."));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse.error("HTTP method '" + ex.getMethod() + "' is not supported for this endpoint."));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoResourceFound(NoResourceFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("The requested resource was not found."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unhandled internal server error: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred. Please contact support if the issue persists."));
    }
}
