package com.freshcart.backend.service;

import com.freshcart.backend.dto.tracking.TrackingResponse;
import com.freshcart.backend.exception.ResourceNotFoundException;
import com.freshcart.backend.repository.CustomerRepository;
import com.freshcart.backend.repository.OrderRepository;
import com.freshcart.backend.repository.TrackingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrackingServiceImpl implements TrackingService {

    private final TrackingRepository trackingRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    public TrackingServiceImpl(TrackingRepository trackingRepository,
                               OrderRepository orderRepository,
                               CustomerRepository customerRepository) {
        this.trackingRepository = trackingRepository;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public TrackingResponse getTrackingByOrderId(Integer orderId, Integer customerId) {
        if (!orderRepository.existsById(orderId)) {
            throw new ResourceNotFoundException("Order not found with id: " + orderId);
        }

        TrackingResponse tracking = trackingRepository.findTrackingByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Tracking information not found for order ID: " + orderId));

        if (customerId != null) {
            if (!customerRepository.existsById(customerId)) {
                throw new ResourceNotFoundException("Customer not found with id: " + customerId);
            }
            if (!tracking.getCustomerId().equals(customerId)) {
                throw new ResourceNotFoundException("Order not found for customer: " + customerId);
            }
        }

        return tracking;
    }

    @Override
    public List<TrackingResponse> searchTracking(Integer customerId, String orderStatus, String deliveryStatus, String paymentStatus) {
        if (customerId != null && !customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        return trackingRepository.searchTracking(customerId, orderStatus, deliveryStatus, paymentStatus);
    }
}
