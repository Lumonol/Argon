import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Database, Key, Save } from 'lucide-react';

export const ConfigurationPage = () => {
  const [dbUrl, setDbUrl] = useState('');
  const [authProvider, setAuthProvider] = useState('clerk');
  const [authKey, setAuthKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch initial config
    const loadConfig = async () => {
      try {
        const [dbRes, authRes] = await Promise.all([
          fetch('/api/config/database'),
          fetch('/api/config/auth')
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
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, value })
      });
      
      if (!res.ok) {
        throw new Error(`Failed to save ${key} config.`);
      }
    } catch (err) {
      throw err;
    }
  };

  const saveAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        handleSave('database', { url: dbUrl }),
        handleSave('auth', { provider: authProvider, key: authKey })
      ]);
      toast.success('Configuration saved successfully!');
    } catch (err) {
      toast.error('An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full p-6">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your database and authentication provider for Argon</p>
        </div>
        <Button 
          onClick={saveAll}
          disabled={loading}
          size="sm"
          variant="secondary"
          className="gap-2"
        >
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </div>

      <Card className="border-border/30 bg-card/50 w-full shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3 group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Database Settings</p>
                <p className="text-xs text-muted-foreground">Configure your postgres database connection string.</p>
              </div>
            </div>
            <div className="pl-11 space-y-1.5 w-full">
              <Label className="text-xs">Connection URL</Label>
              <Input 
                id="dbUrl" 
                value={dbUrl} 
                onChange={(e) => setDbUrl(e.target.value)} 
                placeholder="postgresql://user:password@localhost:5432/db" 
                className="h-9 text-sm bg-background/50 max-w-4xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-border/30 bg-card/50 w-full shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3 group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Authentication Settings</p>
                <p className="text-xs text-muted-foreground">Configure your Auth provider (e.g. Clerk, Supabase).</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11 w-full max-w-4xl">
              <div className="space-y-1.5">
                <Label className="text-xs">Provider</Label>
                <Select value={authProvider} onValueChange={setAuthProvider}>
                  <SelectTrigger className="h-9 text-sm bg-background/50"><SelectValue placeholder="Select a provider" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clerk">Clerk</SelectItem>
                    <SelectItem value="supabase">Supabase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Secret Key</Label>
                <Input 
                  type="password"
                  value={authKey} 
                  onChange={(e) => setAuthKey(e.target.value)} 
                  placeholder="sk_test_..." 
                  className="h-9 text-sm bg-background/50"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
