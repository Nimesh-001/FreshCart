package com.freshcart.backend.service;

import com.freshcart.backend.dto.order.OrderResponse;
import com.freshcart.backend.dto.payment.PaymentResponse;
import com.freshcart.backend.dto.payment.ProcessPaymentRequest;
import com.freshcart.backend.dto.payment.RefundPaymentRequest;
import com.freshcart.backend.dto.payment.RefundResponse;
import com.freshcart.backend.exception.DuplicateResourceException;
import com.freshcart.backend.exception.ResourceNotFoundException;
import com.freshcart.backend.repository.CustomerRepository;
import com.freshcart.backend.repository.OrderRepository;
import com.freshcart.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    // Concurrency lock per order ID
    private final ConcurrentHashMap<Integer, Object> orderLocks = new ConcurrentHashMap<>();

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              OrderRepository orderRepository,
                              CustomerRepository customerRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
    }

    private Object getOrderLock(Integer orderId) {
        return orderLocks.computeIfAbsent(orderId, k -> new Object());
    }

    @Override
    public PaymentResponse processPayment(ProcessPaymentRequest request) {
        Integer orderId = request.getOrderId();

        OrderResponse order = orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (request.getCustomerId() != null) {
            if (!customerRepository.existsById(request.getCustomerId())) {
                throw new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId());
            }
            if (!order.getCustomerId().equals(request.getCustomerId())) {
                throw new IllegalArgumentException("Order does not belong to customer: " + request.getCustomerId());
            }
        }

        String status = order.getStatus();
        if ("CANCELLED".equalsIgnoreCase(status) || "REFUNDED".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Order is " + status.toLowerCase() + " and not eligible for payment");
        }

        if (request.getAmount() == null || request.getAmount().compareTo(order.getTotalAmount()) != 0) {
            throw new IllegalArgumentException("Payment amount does not match order total. Expected: " +
                    order.getTotalAmount() + ", Provided: " + request.getAmount());
        }

        String method = request.getPaymentMethod().trim().toUpperCase();
        if (!"CASH_ON_DELIVERY".equals(method) && !"CARD".equals(method) && !"ONLINE".equals(method)) {
            throw new IllegalArgumentException("Invalid payment method: " + request.getPaymentMethod());
        }

        String transactionRef = request.getTransactionReference();
        if (!"CASH_ON_DELIVERY".equals(method)) {
            if (transactionRef != null && !transactionRef.isBlank()) {
                transactionRef = transactionRef.trim();
                if (paymentRepository.isTransactionReferenceUsed(transactionRef)) {
                    throw new DuplicateResourceException("Transaction reference already exists: " + transactionRef);
                }
            } else {
                // Generate a verified simulation transaction reference for demo payment
                transactionRef = "SIM-" + method + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
            }
        } else {
            transactionRef = null;
        }

        synchronized (getOrderLock(orderId)) {
            if (paymentRepository.existsByOrderId(orderId)) {
                throw new DuplicateResourceException("A payment record already exists for order ID: " + orderId);
            }

            paymentRepository.processPayment(orderId, method, request.getAmount(), transactionRef);
        }

        PaymentResponse response = paymentRepository.findPaymentByOrderId(orderId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve payment after processing"));

        if ("CASH_ON_DELIVERY".equalsIgnoreCase(response.getPaymentMethod())) {
            response.setMessage("Cash on delivery payment recorded. Payment status is PENDING until delivery.");
            response.setIsSimulated(false);
        } else {
            response.setMessage("Payment processed successfully via simulated payment gateway.");
            response.setIsSimulated(true);
        }

        return response;
    }

    @Override
    public RefundResponse processRefund(RefundPaymentRequest request) {
        Integer orderId = request.getOrderId();

        OrderResponse order = orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (request.getCustomerId() != null) {
            if (!customerRepository.existsById(request.getCustomerId())) {
                throw new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId());
            }
            if (!order.getCustomerId().equals(request.getCustomerId())) {
                throw new IllegalArgumentException("Order does not belong to customer: " + request.getCustomerId());
            }
        }

        PaymentResponse payment = paymentRepository.findPaymentByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for order ID: " + orderId));

        if ("REFUNDED".equalsIgnoreCase(payment.getPaymentStatus())) {
            throw new IllegalArgumentException("Payment for order ID " + orderId + " has already been refunded");
        }

        if (!"SUCCESS".equalsIgnoreCase(payment.getPaymentStatus())) {
            throw new IllegalArgumentException("Only successful payments can be refunded. Current payment status: " + payment.getPaymentStatus());
        }

        if ("CANCELLED".equalsIgnoreCase(order.getStatus()) || "REFUNDED".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalArgumentException("Order is already " + order.getStatus().toLowerCase() + ". Refund cannot be processed.");
        }

        synchronized (getOrderLock(orderId)) {
            paymentRepository.processRefund(orderId);
        }

        PaymentResponse updatedPayment = paymentRepository.findPaymentByOrderId(orderId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve payment after refund"));

        return new RefundResponse(
                orderId,
                updatedPayment.getPaymentId(),
                updatedPayment.getAmount(),
                updatedPayment.getPaymentStatus(),
                "REFUNDED",
                updatedPayment.getPaymentDate(),
                "Refund processed successfully. Order status updated to REFUNDED."
        );
    }

    @Override
    public PaymentResponse getPaymentByOrderId(Integer orderId, Integer customerId) {
        OrderResponse order = orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (customerId != null) {
            if (!order.getCustomerId().equals(customerId)) {
                throw new ResourceNotFoundException("Order not found for customer: " + customerId);
            }
        }

        PaymentResponse response = paymentRepository.findPaymentByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for order ID: " + orderId));

        boolean simulated = !"CASH_ON_DELIVERY".equalsIgnoreCase(response.getPaymentMethod());
        response.setIsSimulated(simulated);
        response.setMessage(simulated ? "Simulated payment transaction" : "Cash on delivery payment");
        return response;
    }
}
