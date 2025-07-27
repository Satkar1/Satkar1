import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Mic, MicOff, Clock, Zap, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function EmergencyOrder() {
  const [, setLocation] = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [orderText, setOrderText] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start/stop voice recording
    if (!isRecording) {
      setOrderText("Recording voice note... (Demo: 'I need 5kg tomatoes, 2kg onions, and 1kg chili powder urgently for my stall')");
    }
  };

  const handleEmergencyOrder = () => {
    // In a real app, this would submit the emergency order
    alert("Emergency order submitted! You'll receive confirmation within 2 minutes.");
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 p-4 text-white sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Emergency Order</span>
              </h1>
              <p className="text-sm text-orange-100">30-minute guaranteed delivery</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Emergency Info */}
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-700 flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Emergency Delivery</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold text-red-600">Delivery Time</div>
                <div className="text-gray-600">30 minutes max</div>
              </div>
              <div>
                <div className="font-semibold text-red-600">Emergency Fee</div>
                <div className="text-gray-600">₹50 extra</div>
              </div>
              <div>
                <div className="font-semibold text-red-600">Availability</div>
                <div className="text-gray-600">24/7 service</div>
              </div>
              <div>
                <div className="font-semibold text-red-600">Payment</div>
                <div className="text-gray-600">Cash on delivery</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Recording */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mic className="h-5 w-5" />
              <span>Voice Order</span>
              <Badge variant="secondary">Recommended</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Record your order in Hindi or English. AI will understand and process it instantly.
            </p>
            
            <div className="flex items-center justify-center">
              <Button
                onClick={handleVoiceToggle}
                size="lg"
                className={`w-32 h-32 rounded-full ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                }`}
              >
                {isRecording ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            </div>
            
            <p className="text-center text-sm text-gray-500">
              {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
            </p>
          </CardContent>
        </Card>

        {/* Text Order */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Text Order</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Type your emergency order here... (e.g., 5kg tomatoes, 2kg onions, 1kg chili powder)"
              value={orderText}
              onChange={(e) => setOrderText(e.target.value)}
              rows={4}
            />
            
            <Input
              placeholder="Your phone number for delivery updates"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              type="tel"
            />
          </CardContent>
        </Card>

        {/* Quick Items */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Add Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Tomatoes 5kg", icon: "🍅" },
                { name: "Onions 3kg", icon: "🧅" },
                { name: "Potatoes 5kg", icon: "🥔" },
                { name: "Chili Powder 1kg", icon: "🌶️" },
                { name: "Cooking Oil 2L", icon: "🫗" },
                { name: "Rice 10kg", icon: "🌾" }
              ].map((item) => (
                <Button
                  key={item.name}
                  variant="outline"
                  size="sm"
                  className="h-auto p-3 flex flex-col items-center space-y-1"
                  onClick={() => setOrderText(prev => prev + (prev ? ", " : "") + item.name)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs text-center">{item.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="space-y-3">
          <Button
            onClick={handleEmergencyOrder}
            className="w-full h-14 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-lg font-bold"
            disabled={!orderText.trim() && !isRecording}
          >
            <Zap className="h-5 w-5 mr-2" />
            Submit Emergency Order
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>You'll receive a call within 2 minutes</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-semibold text-yellow-800 mb-2">Need Immediate Help?</h3>
              <Button variant="outline" size="sm" className="border-yellow-400 text-yellow-700">
                <Phone className="h-4 w-4 mr-2" />
                Call Emergency Hotline
              </Button>
              <p className="text-xs text-yellow-600 mt-2">Available 24/7: +91-98765-43210</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}