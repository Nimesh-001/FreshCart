package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.dto.payment.PaymentResponse;
import com.freshcart.backend.dto.payment.ProcessPaymentRequest;
import com.freshcart.backend.dto.payment.RefundPaymentRequest;
import com.freshcart.backend.dto.payment.RefundResponse;
import com.freshcart.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping({"", "/process"})
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@Valid @RequestBody ProcessPaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.getMessage(), response));
    }

    @PostMapping({"/refund", "/{orderId}/refund"})
    public ResponseEntity<ApiResponse<RefundResponse>> refundPayment(
            @PathVariable(required = false) Integer orderId,
            @RequestParam(required = false) Integer customerId,
            @RequestBody(required = false) RefundPaymentRequest request
    ) {
        Integer effectiveOrderId = orderId;
        Integer effectiveCustomerId = customerId;
        String reason = null;

        if (request != null) {
            if (request.getOrderId() != null) {
                effectiveOrderId = request.getOrderId();
            }
            if (request.getCustomerId() != null) {
                effectiveCustomerId = request.getCustomerId();
            }
            reason = request.getReason();
        }

        if (effectiveOrderId == null) {
            throw new IllegalArgumentException("Order ID is required to process refund");
        }

        RefundPaymentRequest effectiveRequest = new RefundPaymentRequest(effectiveOrderId, effectiveCustomerId, reason);
        RefundResponse response = paymentService.processRefund(effectiveRequest);

        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrderId(
            @PathVariable Integer orderId,
            @RequestParam(required = false) Integer customerId
    ) {
        PaymentResponse response = paymentService.getPaymentByOrderId(orderId, customerId);
        return ResponseEntity.ok(ApiResponse.success("Payment details retrieved successfully", response));
    }
}
