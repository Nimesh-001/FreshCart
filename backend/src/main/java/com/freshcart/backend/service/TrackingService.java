package com.freshcart.backend.service;

import com.freshcart.backend.dto.tracking.TrackingResponse;

import java.util.List;

public interface TrackingService {

    TrackingResponse getTrackingByOrderId(Integer orderId, Integer customerId);

    List<TrackingResponse> searchTracking(Integer customerId, String orderStatus, String deliveryStatus, String paymentStatus);
}
