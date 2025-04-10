// src/controllers/order.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import {
    createOrder,
    getOrdersByUserId,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrders, // Import the new service function
    getOrderHistory, // Import the history service function
    updateOrderPaymentStatus // Import the payment status update service function
} from '../services/order.service';
import { PaymentMethod, OrderStatus, User, UserRole, PaymentStatus } from '@prisma/client'; // Import enums (Added PaymentStatus)


// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
export const handleCreateOrder = asyncHandler(async (req: Request, res: Response) => {
    // Validation is handled by the validateRequestBody middleware
    // req.body contains validated data: { shippingAddressId, paymentMethod, items, voucherCode?, note? }
    const validatedBody = req.body;
    const userId = req.user.id; // Get user ID from authenticated user (guaranteed by middleware)

    try {
        const orderInput = {
            userId,
            shippingAddressId: validatedBody.shippingAddressId,
            paymentMethod: validatedBody.paymentMethod,
            items: validatedBody.orderItems,
            voucherCode: validatedBody.voucherCode,
            note: validatedBody.note,
        };
        const createdOrder = await createOrder(orderInput);
        res.status(201).json(createdOrder);
    } catch (error: any) {
        // Catch specific errors from service if needed (e.g., stock issues)
        res.status(400); // Bad request for issues like insufficient stock, invalid voucher
        throw new Error(error.message || 'Failed to create order');
    }
});

// @desc    Get all orders (for Admin/Staff)
// @route   GET /api/orders
// @access  Private (Staff/Admin)
export const handleGetAllOrders = asyncHandler(async (req: Request, res: Response) => {
    // Authorization is handled by the isStaffOrAdmin middleware in the route
    const orders = await getAllOrders();
    res.status(200).json(orders);
    // No specific error handling needed here unless getAllOrders throws something specific
});


// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private (Customer)
export const handleGetMyOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id; // Guaranteed by authenticate middleware

    const orders = await getOrdersByUserId(userId);
    res.status(200).json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Customer owns order, or Admin/Staff)
export const handleGetOrderById = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const userId = req.user.id; // Guaranteed by authenticate middleware
    const userRole = req.user.role; // Guaranteed by authenticate middleware

    try {
        // Allow Admin/Staff to view any order, otherwise check ownership
        const order = await getOrderById(orderId, ['ADMIN', 'STAFF'].includes(userRole || '') ? undefined : userId);
        res.status(200).json(order);
    } catch (error: any) {
        res.status(404); // Not found if order doesn't exist or user doesn't have access
        throw new Error(error.message || 'Order not found');
    }
});


// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Staff/Admin)
export const handleUpdateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    // Validation is handled by the validateRequestBody middleware
    // req.body contains validated data: { status }
    const { status } = req.body;

    try {
        const actorUserId = req.user.id; // Get ID of user performing the action
        const updatedOrder = await updateOrderStatus(orderId, status, actorUserId); // Pass actorUserId
        res.status(200).json(updatedOrder);
    } catch (error: any) {
        res.status(400); // Or 404 if order not found
        throw new Error(error.message || 'Failed to update order status');
    }
});

// @desc    Get order history by ID
// @route   GET /api/orders/:id/history
// @access  Private (Owner or Staff/Admin)
export const handleGetOrderHistory = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        // First, verify the user has access to the order itself
        await getOrderById(orderId, ['ADMIN', 'STAFF'].includes(userRole || '') ? undefined : userId);

        // If access is verified, fetch the history
        const history = await getOrderHistory(orderId);
        res.status(200).json(history);
    } catch (error: any) {
        // Handle cases where the order doesn't exist or user lacks access
        res.status(404);
        throw new Error(error.message || 'Order not found or access denied');
    }
});

// @desc    Update order payment status (Manual by Admin/Staff)
// @route   PUT /api/orders/:id/payment-status
// @access  Private (Staff/Admin)
export const handleUpdateOrderPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    // Validation is handled by the validateRequestBody middleware
    // req.body contains validated data: { paymentStatus, transactionId? }
    const { paymentStatus, transactionId } = req.body as { paymentStatus: PaymentStatus, transactionId?: string };
    const actorUserId = req.user.id; // Guaranteed by authenticate middleware

    try {
        const updatedOrder = await updateOrderPaymentStatus(orderId, paymentStatus, actorUserId, transactionId);
        res.status(200).json(updatedOrder);
    } catch (error: any) {
        res.status(400); // Or 404 if order not found
        throw new Error(error.message || 'Failed to update order payment status');
    }
});

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Owner or Staff/Admin)
export const handleCancelOrder = asyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role as UserRole;

    if (!userId || !userRole) {
         // Should be guaranteed by authenticate middleware
        res.status(401);
        throw new Error('Authentication details missing.');
    }

    try {
        const actorUserId = req.user.id; // Get ID of user performing the action (could be owner or admin/staff)
        const canceledOrder = await cancelOrder(orderId, userId, userRole, actorUserId); // Pass actorUserId
        res.status(200).json(canceledOrder);
    } catch (error: any) {
        res.status(400); // Or 403 for auth error, 404 for not found
        throw new Error(error.message || 'Failed to cancel order');
    }
});

// Export all handlers
export default {
    handleCreateOrder,
    handleGetAllOrders,
    handleGetMyOrders,
    handleGetOrderById,
    handleUpdateOrderStatus,
    handleCancelOrder,
    handleGetOrderHistory,
    handleUpdateOrderPaymentStatus
};
