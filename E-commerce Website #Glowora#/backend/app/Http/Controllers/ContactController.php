<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Mail\ContactFormMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'subject' => 'required|string|max:255',
                'message' => 'required|string'
            ]);

            // Create contact message record
            $contact = ContactMessage::create([
                'name' => $request->name,
                'email' => $request->email,
                'subject' => $request->subject,
                'message' => $request->message,
                'status' => 'new'
            ]);

            // Send email
            Mail::to(config('mail.from.address'))->send(new ContactFormMail([
                'name' => $request->name,
                'email' => $request->email,
                'subject' => $request->subject,
                'message' => $request->message
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => $contact
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error sending contact message: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error sending message'
            ], 500);
        }
    }

    public function index()
    {
        try {
            $messages = ContactMessage::orderBy('created_at', 'desc')->paginate(10);
            
            return response()->json([
                'success' => true,
                'data' => $messages
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching contact messages: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching messages'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $message = ContactMessage::findOrFail($id);
            
            // Mark message as read if it's new
            if ($message->status === 'new') {
                $message->update(['status' => 'read']);
            }

            return response()->json([
                'success' => true,
                'data' => $message
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching contact message: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching message'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $message = ContactMessage::findOrFail($id);
            
            $request->validate([
                'status' => 'required|in:new,read,replied'
            ]);

            $message->update([
                'status' => $request->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Message status updated successfully',
                'data' => $message
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating contact message: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating message'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $message = ContactMessage::findOrFail($id);
            $message->delete();

            return response()->json([
                'success' => true,
                'message' => 'Message deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting contact message: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting message'
            ], 500);
        }
    }
} 