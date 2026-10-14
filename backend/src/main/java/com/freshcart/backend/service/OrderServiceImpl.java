package com.freshcart.backend.service;

import com.freshcart.backend.dto.cart.CartResponse;
import com.freshcart.backend.dto.order.CheckoutRequest;
import com.freshcart.backend.dto.order.OrderResponse;
import com.freshcart.backend.exception.ResourceNotFoundException;
import com.freshcart.backend.repository.CartRepository;
import com.freshcart.backend.repository.CustomerRepository;
import com.freshcart.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CustomerRepository customerRepository;

    // Concurrency guard per customer to prevent race conditions during checkout or cancellation
    private final ConcurrentHashMap<Integer, Object> customerLocks = new ConcurrentHashMap<>();

    public OrderServiceImpl(OrderRepository orderRepository,
                            CartRepository cartRepository,
                            CustomerRepository customerRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.customerRepository = customerRepository;
    }

    private Object getCustomerLock(Integer customerId) {
        return customerLocks.computeIfAbsent(customerId, k -> new Object());
    }

    @Override
    public OrderResponse checkout(CheckoutRequest request) {
        if (!customerRepository.existsById(request.getCustomerId())) {
            throw new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId());
        }

        if (customerRepository.findAddressByIdAndCustomerId(request.getAddressId(), request.getCustomerId()).isEmpty()) {
            throw new IllegalArgumentException("Address does not belong to this customer");
        }

        CartResponse cart = cartRepository.findActiveCartByCustomerId(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Active cart not found"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cannot checkout an empty cart");
        }

        Integer orderId;
        synchronized (getCustomerLock(request.getCustomerId())) {
            orderId = orderRepository.checkout(request.getCustomerId(), request.getAddressId());

            if (request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()) {
                String method = request.getPaymentMethod().trim().toUpperCase();
                if ("CASH_ON_DELIVERY".equals(method)) {
                    OrderResponse createdOrder = orderRepository.findOrderById(orderId)
                            .orElseThrow(() -> new IllegalStateException("Failed to retrieve created order"));
                    orderRepository.processPayment(orderId, "CASH_ON_DELIVERY", createdOrder.getTotalAmount(), null);
                }
            }
        }

        return orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve created order after checkout"));
    }

    @Override
    public OrderResponse cancelOrder(Integer customerId, Integer orderId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        OrderResponse order = orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getCustomerId().equals(customerId)) {
            throw new IllegalArgumentException("Order does not belong to customer: " + customerId);
        }

        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalArgumentException("Only pending orders can be cancelled. Current status: " + order.getStatus());
        }

        synchronized (getCustomerLock(customerId)) {
            orderRepository.cancelOrder(customerId, orderId);
        }

        return orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve order after cancellation"));
    }

    @Override
    public List<OrderResponse> getOrderHistory(Integer customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        return orderRepository.findOrderHistoryByCustomerId(customerId);
    }

    @Override
    public OrderResponse getOrderById(Integer customerId, Integer orderId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        OrderResponse order = orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getCustomerId().equals(customerId)) {
            throw new ResourceNotFoundException("Order not found for customer: " + customerId);
        }

        return order;
    }
}
