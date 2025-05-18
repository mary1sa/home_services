<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // Get all bookings with relationships
    public function index()
    {
        return response()->json(
            Booking::with(['user', 'tasker', 'service', 'promotion'])->get()
        );
    }

    // Store a new booking
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'tasker_id' => 'required|exists:taskers,id',
            'service_id' => 'nullable|exists:services,id',
            'promotion_id' => 'nullable|exists:promotions,id',
            'booking_date' => 'required|date',
            'details' => 'nullable|string',
            'status' => 'in:pending,approved,rejected,completed',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        $booking = Booking::create($validated);

        return response()->json($booking, 201);
    }

    // Show a specific booking
    public function show($id)
    {
        $booking = Booking::with(['user', 'tasker', 'service', 'promotion'])->findOrFail($id);
        return response()->json($booking);
    }

    // Update a booking
    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'tasker_id' => 'sometimes|exists:taskers,id',
            'service_id' => 'nullable|exists:services,id',
            'promotion_id' => 'nullable|exists:promotions,id',
            'booking_date' => 'sometimes|date',
            'details' => 'nullable|string',
            'status' => 'in:pending,approved,rejected,completed',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        $booking->update($validated);

        return response()->json($booking);
    }

    // Delete a booking
    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->delete();

        return response()->json(['message' => 'Booking deleted successfully']);
    }
}
