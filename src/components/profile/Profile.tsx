import { useAuth } from "@/context/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client"
import React, { useEffect, useState } from 'react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [setUser] = useState(null);

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        setUser(user);
      }
    };

    getUserProfile();
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">You are not logged in</h1>
        <Button onClick={() => navigate("/auth")} className="bg-ustp-blue text-white">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto shadow-lg rounded-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">
                {user.user_metadata.first_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{user.user_metadata.first_name + "  "+ user.user_metadata.last_name || "No Name Provided"}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Email</h3>
              <p className="text-base text-gray-800">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Role</h3>
              <p className="text-base text-gray-800">{user.user_metadata.user_type || "USTP Student"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Account Created</h3>
              <p className="text-base text-gray-800">
                {new Date(user.created_at).toLocaleDateString() || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-ustp-blue text-white hover:bg-ustp-darkblue"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;