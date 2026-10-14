package com.freshcart.backend.service;

import com.freshcart.backend.dto.delivery.AssignDeliveryRequest;
import com.freshcart.backend.dto.delivery.DeliveryResponse;
import com.freshcart.backend.dto.delivery.UpdateDeliveryStatusRequest;

public interface DeliveryService {

    DeliveryResponse assignDelivery(AssignDeliveryRequest request);

    DeliveryResponse updateDeliveryStatus(Integer orderId, UpdateDeliveryStatusRequest request);

    DeliveryResponse getDeliveryByOrderId(Integer orderId);
}
