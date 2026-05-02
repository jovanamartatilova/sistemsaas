// app/Http/Controllers/ContactMessageController.php
<?php
namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'message' => 'required|string',
        ]);
        ContactMessage::create($validated);
        return response()->json(['message' => 'Message sent successfully'], 201);
    }

    public function index()
    {
        $messages = ContactMessage::orderBy('created_at', 'desc')->get();
        return response()->json($messages);
    }

    public function markRead($id)
    {
        $msg = ContactMessage::findOrFail($id);
        $msg->update(['is_read' => true]);
        return response()->json(['message' => 'Marked as read']);
    }

    public function destroy($id)
    {
        ContactMessage::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
