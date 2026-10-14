package com.freshcart.backend.repository;

import com.freshcart.backend.dto.tracking.TrackingResponse;

import java.util.List;
import java.util.Optional;

public interface TrackingRepository {

    Optional<TrackingResponse> findTrackingByOrderId(Integer orderId);

    List<TrackingResponse> findTrackingUsingProcedure(Integer orderId);

    List<TrackingResponse> searchTracking(Integer customerId, String orderStatus, String deliveryStatus, String paymentStatus);
}
