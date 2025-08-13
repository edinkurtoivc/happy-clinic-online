
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
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Unesite ispravnu email adresu"),
  password: z.string().min(1, "Šifra je obavezna")
});

export default function Login() {
  const { login, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Prefill email from previous session if 'remember me' was used
  const initialEmail = typeof window !== 'undefined' ? (localStorage.getItem('rememberedEmail') || '') : '';
  const [rememberMe, setRememberMe] = useState<boolean>(!!initialEmail);

  // Check if already authenticated or bypass is enabled
  useEffect(() => {
    // Only navigate if authenticated (not just bypassed)
    if (isAuthenticated && !isLoadingAuth) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, isLoadingAuth]);

  // SEO: title, meta description, canonical
  useEffect(() => {
    document.title = "Prijava | EIBS";
    const desc = "Prijava u EIBS – pristup sistemu kliničke evidencije";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', desc);
    }
    const canonicalHref = `${window.location.origin}/login`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalHref);
  }, []);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: initialEmail,
      password: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      setLoginError(null);
      console.log("🔍 LOGIN: Login attempt with email:", values.email);
      console.log("🔍 LOGIN: Password length:", values.password.length);
      
      const success = await login(values.email, values.password);
      
      console.log("🔍 LOGIN: Login result:", success);
      
      if (success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', values.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        console.log("🔍 LOGIN: Login successful, navigating to dashboard");
        toast({
          title: "Dobrodošli",
          description: "Uspješno ste prijavljeni."
        });
        navigate('/');
      } else {
        console.log("🔍 LOGIN: Login failed");
        setLoginError("Prijava nije uspjela. Provjerite svoje podatke.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError("Došlo je do greške prilikom prijave. Pokušajte ponovo.");
      
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom prijave",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Učitavanje...</div>
      </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img src="/lovable-uploads/44afc1d2-0672-4a2d-acdd-3d4de4007dbb.png" alt="EIBS logo – prijava" className="h-32 w-32" />
          </div>
          <CardTitle className="text-center text-2xl">Prijava u sistem</CardTitle>
          <CardDescription className="text-center">Unesite svoje podatke za pristup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                {loginError}
              </AlertDescription>
            </Alert>
          )}
        
          
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="vasa.email@adresa.com" 
                        autoComplete="username" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Šifra</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          autoComplete="current-password" 
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Sakrij šifru" : "Prikaži šifru"}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="rememberMe" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} disabled={isLoading} />
                  <Label htmlFor="rememberMe">Zapamti me</Label>
                </div>
                <Button 
                  type="button" 
                  variant="link" 
                  className="px-0 font-normal text-sm h-auto"
                  onClick={() => {
                    toast({
                      title: "Zaboravljena šifra",
                      description: "Kontaktirajte administratora za resetovanje šifre.",
                    });
                  }}
                  disabled={isLoading}
                >
                  Zaboravili ste šifru?
                </Button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Prijava u toku..." : "Prijavi se"}
              </Button>
            </form>
          </Form>
          
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-muted-foreground w-full">
            Sistem kliničke evidencije | v1.0.0
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
