<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    // List all payments
    public function index()
    {
        return response()->json(Payment::with('booking')->get());
    }

    // Store a new payment
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'required|numeric|min:0',
            'method' => 'required|in:cash,card,paypal',
            'status' => 'in:pending,paid,failed',
            'paid_at' => 'nullable|date',
        ]);

        $payment = Payment::create($validated);

        return response()->json($payment, 201);
    }

    // Show a payment
    public function show($id)
    {
        $payment = Payment::with('booking')->findOrFail($id);
        return response()->json($payment);
    }

    // Update a payment
    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'booking_id' => 'sometimes|exists:bookings,id',
            'amount' => 'sometimes|numeric|min:0',
            'method' => 'sometimes|in:cash,card,paypal',
            'status' => 'sometimes|in:pending,paid,failed',
            'paid_at' => 'nullable|date',
        ]);

        $payment->update($validated);

        return response()->json($payment);
    }

    // Delete a payment
    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }
}
