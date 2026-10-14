package com.freshcart.backend.service;

import com.freshcart.backend.dto.delivery.AssignDeliveryRequest;
import com.freshcart.backend.dto.delivery.DeliveryResponse;
import com.freshcart.backend.dto.delivery.UpdateDeliveryStatusRequest;
import com.freshcart.backend.dto.order.OrderResponse;
import com.freshcart.backend.dto.payment.PaymentResponse;
import com.freshcart.backend.exception.DuplicateResourceException;
import com.freshcart.backend.exception.ResourceNotFoundException;
import com.freshcart.backend.repository.DeliveryRepository;
import com.freshcart.backend.repository.OrderRepository;
import com.freshcart.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    // Concurrency lock per order ID
    private final ConcurrentHashMap<Integer, Object> orderLocks = new ConcurrentHashMap<>();

    public DeliveryServiceImpl(DeliveryRepository deliveryRepository,
                               OrderRepository orderRepository,
                               PaymentRepository paymentRepository) {
        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    private Object getOrderLock(Integer orderId) {
        return orderLocks.computeIfAbsent(orderId, k -> new Object());
    }

    @Override
    public DeliveryResponse assignDelivery(AssignDeliveryRequest request) {
        Integer orderId = request.getOrderId();

        OrderResponse order = orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        String orderStatus = order.getStatus();
        if ("CANCELLED".equalsIgnoreCase(orderStatus) || "REFUNDED".equalsIgnoreCase(orderStatus)) {
            throw new IllegalArgumentException("Cannot assign delivery for an order that is " + orderStatus.toLowerCase());
        }

        if (!"PAID".equalsIgnoreCase(orderStatus) && !"PROCESSING".equalsIgnoreCase(orderStatus)) {
            Optional<PaymentResponse> paymentOpt = paymentRepository.findPaymentByOrderId(orderId);
            if (paymentOpt.isPresent() && "CASH_ON_DELIVERY".equalsIgnoreCase(paymentOpt.get().getPaymentMethod())
                    && "PENDING".equalsIgnoreCase(orderStatus)) {
                throw new IllegalArgumentException("COD order #" + orderId + " is currently in PENDING status. " +
                        "Database rules require order status to be PAID or PROCESSING before delivery assignment. " +
                        "This represents an existing database workflow conflict for Cash On Delivery.");
            }
            throw new IllegalArgumentException("Only paid or processing orders can be assigned. Current order status: " + orderStatus);
        }

        synchronized (getOrderLock(orderId)) {
            Optional<DeliveryResponse> existingDelivery = deliveryRepository.findDeliveryByOrderId(orderId);
            if (existingDelivery.isPresent()) {
                String curStatus = existingDelivery.get().getDeliveryStatus();
                if ("ASSIGNED".equalsIgnoreCase(curStatus) || "OUT_FOR_DELIVERY".equalsIgnoreCase(curStatus) || "DELIVERED".equalsIgnoreCase(curStatus)) {
                    throw new DuplicateResourceException("Delivery is already assigned for order ID: " + orderId + " (current status: " + curStatus + ")");
                }
            }

            deliveryRepository.assignDelivery(orderId, request.getDeliveryPerson().trim(), request.getDeliveryPhone().trim());
        }

        DeliveryResponse response = deliveryRepository.findDeliveryByOrderId(orderId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve delivery after assignment"));
        response.setMessage("Delivery assigned successfully. Order status updated to PROCESSING.");
        return response;
    }

    @Override
    public DeliveryResponse updateDeliveryStatus(Integer orderId, UpdateDeliveryStatusRequest request) {
        OrderResponse order = orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        String orderStatus = order.getStatus();
        if ("CANCELLED".equalsIgnoreCase(orderStatus) || "REFUNDED".equalsIgnoreCase(orderStatus)) {
            throw new IllegalArgumentException("Cannot update delivery status for a " + orderStatus.toLowerCase() + " order");
        }

        DeliveryResponse currentDelivery = deliveryRepository.findDeliveryByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery record not found for order ID: " + orderId));

        String currentStatus = currentDelivery.getDeliveryStatus().toUpperCase();
        String newStatus = request.getStatus().trim().toUpperCase();

        if ("DELIVERED".equals(currentStatus) && !"DELIVERED".equals(newStatus)) {
            throw new IllegalArgumentException("Delivered orders cannot be reopened here");
        }

        if ("OUT_FOR_DELIVERY".equals(currentStatus) && ("PENDING".equals(newStatus) || "ASSIGNED".equals(newStatus))) {
            throw new IllegalArgumentException("Invalid delivery status transition from " + currentStatus + " to " + newStatus);
        }

        if ("PENDING".equals(currentStatus) && ("DELIVERED".equals(newStatus) || "OUT_FOR_DELIVERY".equals(newStatus))) {
            throw new IllegalArgumentException("Cannot move directly from PENDING to " + newStatus + " without assigning delivery first");
        }

        synchronized (getOrderLock(orderId)) {
            deliveryRepository.updateDeliveryStatus(orderId, newStatus);
        }

        DeliveryResponse response = deliveryRepository.findDeliveryByOrderId(orderId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve delivery after status update"));
        response.setMessage("Delivery status updated to " + newStatus + " successfully.");
        return response;
    }

    @Override
    public DeliveryResponse getDeliveryByOrderId(Integer orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }

        return deliveryRepository.findDeliveryByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery record not found for order ID: " + orderId));
    }
}
