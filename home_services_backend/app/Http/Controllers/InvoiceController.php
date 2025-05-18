<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    // Get all invoices
    public function index()
    {
        return response()->json(Invoice::with('booking')->get());
    }

    // Store a new invoice
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'invoice_number' => 'required|unique:invoices,invoice_number',
            'invoice_date' => 'required|date',
            'total' => 'required|numeric|min:0',
        ]);

        $invoice = Invoice::create($validated);

        return response()->json($invoice, 201);
    }

    // Show a specific invoice
    public function show($id)
    {
        $invoice = Invoice::with('booking')->findOrFail($id);
        return response()->json($invoice);
    }

    // Update an invoice
    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'booking_id' => 'sometimes|exists:bookings,id',
            'invoice_number' => 'sometimes|unique:invoices,invoice_number,' . $invoice->id,
            'invoice_date' => 'sometimes|date',
            'total' => 'sometimes|numeric|min:0',
        ]);

        $invoice->update($validated);

        return response()->json($invoice);
    }

    // Delete an invoice
    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted successfully']);
    }
}
