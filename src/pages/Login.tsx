
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email("Unesite ispravnu email adresu"),
  password: z.string().min(1, "Šifra je obavezna")
});

export default function Login() {
  const {
    login,
    isAuthenticated,
    isLoadingAuth
  } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoadingAuth) {
      navigate('/');
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      console.log("Login attempt with:", values.email);
      const success = await login(values.email, values.password);
      
      if (success) {
        navigate('/');
      } else {
        // Track failed login attempts
        setLoginAttempts(prev => prev + 1);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom prijave",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Učitavanje...</div>
      </div>;
  }

  return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img src="/lovable-uploads/44afc1d2-0672-4a2d-acdd-3d4de4007dbb.png" alt="EIBS Logo" className="h-32 w-32" />
          </div>
          <CardDescription className="text-center text-3xl text-slate-600">Prijava</CardDescription>
        </CardHeader>
        <CardContent>
          {loginAttempts > 2 && <Alert variant="destructive" className="mb-4">
              <ShieldAlert className="h-4 w-4 mr-2" />
              <AlertDescription>
                Previše neuspješnih pokušaja. Molimo kontaktirajte administratora ako ne možete pristupiti svom računu.
              </AlertDescription>
            </Alert>}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="email" render={({
              field
            }) => <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="vasa.email@adresa.com" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="password" render={({
              field
            }) => <FormItem>
                    <FormLabel>Šifra</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} autoComplete="current-password" {...field} />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Sakrij šifru" : "Prikaži šifru"}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Prijava u toku..." : "Prijavi se"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>;
}
