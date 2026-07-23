import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Database, Key, Save, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/setup')({
  component: SetupPage,
})

function SetupPage() {
  const navigate = useNavigate();
  const [dbUrl, setDbUrl] = useState('');
  const [authProvider, setAuthProvider] = useState('clerk');
  const [authKey, setAuthKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [dbRes, authRes] = await Promise.all([
          fetch('http://localhost:3000/api/config/database'),
          fetch('http://localhost:3000/api/config/auth')
        ]);
        
        if (dbRes.ok) {
          const data = await dbRes.json();
          if (data.value?.url) setDbUrl(data.value.url);
        }
        
        if (authRes.ok) {
          const data = await authRes.json();
          if (data.value?.provider) setAuthProvider(data.value.provider);
          if (data.value?.key) setAuthKey(data.value.key);
        }
      } catch (err) {
        console.error('Failed to load config', err);
      }
    };
    
    loadConfig();
  }, []);

  const handleSave = async (key: string, value: any) => {
    const res = await fetch('http://localhost:3000/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key, value })
    });
    
    if (!res.ok) {
      throw new Error(`Failed to save ${key} config.`);
    }
  };

  const saveAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        handleSave('database', { url: dbUrl }),
        handleSave('auth', { provider: authProvider, key: authKey })
      ]);
      toast.success('Setup completed successfully!');
      
      // Give the backend a moment to register config, then redirect
      setTimeout(() => {
        navigate({ to: '/dashboard' });
      }, 500);
    } catch (err) {
      toast.error('An error occurred during setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Argon Setup</h1>
            <p className="text-base text-muted-foreground mt-2">Welcome to Argon. Please configure your database and authentication provider to continue.</p>
          </div>
          <Button 
            onClick={saveAll}
            disabled={loading}
            size="lg"
            className="gap-2"
          >
            Complete Setup <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <Card className="border-border/30 bg-card/50 w-full shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium">Database Settings</p>
                  <p className="text-sm text-muted-foreground">Configure your postgres database connection string.</p>
                </div>
              </div>
              <div className="pl-14 space-y-2 w-full">
                <Label className="text-sm">Connection URL</Label>
                <Input 
                  id="dbUrl" 
                  value={dbUrl} 
                  onChange={(e) => setDbUrl(e.target.value)} 
                  placeholder="postgresql://user:password@localhost:5432/db" 
                  className="h-10 text-sm bg-background/50 max-w-4xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/30 bg-card/50 w-full shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium">Authentication Settings</p>
                  <p className="text-sm text-muted-foreground">Configure your Auth provider (e.g. Clerk, Supabase).</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-14 w-full max-w-4xl">
                <div className="space-y-2">
                  <Label className="text-sm">Provider</Label>
                  <Select value={authProvider} onValueChange={setAuthProvider}>
                    <SelectTrigger className="h-10 text-sm bg-background/50"><SelectValue placeholder="Select a provider" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clerk">Clerk</SelectItem>
                      <SelectItem value="supabase">Supabase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Secret Key</Label>
                  <Input 
                    type="password"
                    value={authKey} 
                    onChange={(e) => setAuthKey(e.target.value)} 
                    placeholder="sk_test_..." 
                    className="h-10 text-sm bg-background/50"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
