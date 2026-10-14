package com.freshcart.backend.service;

import com.freshcart.backend.dto.payment.PaymentResponse;
import com.freshcart.backend.dto.payment.ProcessPaymentRequest;
import com.freshcart.backend.dto.payment.RefundPaymentRequest;
import com.freshcart.backend.dto.payment.RefundResponse;

public interface PaymentService {

    PaymentResponse processPayment(ProcessPaymentRequest request);

    RefundResponse processRefund(RefundPaymentRequest request);

    PaymentResponse getPaymentByOrderId(Integer orderId, Integer customerId);
}
