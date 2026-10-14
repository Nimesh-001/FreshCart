package com.freshcart.backend.repository;

import com.freshcart.backend.dto.payment.PaymentResponse;

import java.math.BigDecimal;
import java.util.Optional;

public interface PaymentRepository {

    Integer processPayment(Integer orderId, String paymentMethod, BigDecimal amount, String transactionReference);

    void processRefund(Integer orderId);

    Optional<PaymentResponse> findPaymentByOrderId(Integer orderId);

    Optional<PaymentResponse> findPaymentById(Integer paymentId);

    boolean existsByOrderId(Integer orderId);

    boolean isTransactionReferenceUsed(String transactionReference);
}
