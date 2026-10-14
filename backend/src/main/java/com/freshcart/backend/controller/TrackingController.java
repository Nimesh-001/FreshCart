package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.dto.tracking.TrackingResponse;
import com.freshcart.backend.service.TrackingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    private final TrackingService trackingService;

    public TrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TrackingResponse>>> getTracking(
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String deliveryStatus,
            @RequestParam(required = false) String paymentStatus
    ) {
        List<TrackingResponse> response = trackingService.searchTracking(customerId, orderStatus, deliveryStatus, paymentStatus);
        return ResponseEntity.ok(ApiResponse.success("Tracking records retrieved successfully", response));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<TrackingResponse>> getTrackingByOrderId(
            @PathVariable Integer orderId,
            @RequestParam(required = false) Integer customerId
    ) {
        TrackingResponse response = trackingService.getTrackingByOrderId(orderId, customerId);
        return ResponseEntity.ok(ApiResponse.success("Order tracking details retrieved successfully", response));
    }
}
