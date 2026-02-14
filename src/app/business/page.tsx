'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Scissors, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BusinessPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 bg-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-100 via-transparent to-transparent opacity-40"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="flex-1 text-center lg:text-left space-y-8">
                            <h1 className="text-4xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
                                Potencia tu salón con <span className="text-pink-600">MujerApp</span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                La plataforma integral para gestionar turnos, clientes y ventas. Dale a tu negocio la presencia digital que merece y a tus clientas una experiencia inolvidable.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Button
                                    size="lg"
                                    className="text-lg px-8 py-6 bg-pink-600 hover:bg-pink-700 shadow-lg hover:shadow-pink-200 transition-all rounded-full"
                                    onClick={() => router.push('/business/register')}
                                >
                                    Registrar mi salón <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full border-2">
                                    Ver demo
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 w-full max-w-lg lg:max-w-none">
                            <div className="relative aspect-square lg:aspect-[4/3] rounded-[2rem] bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl flex flex-col items-center justify-center p-8 text-white overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                                <div className="text-center space-y-4">
                                    <Scissors className="h-16 w-16 mx-auto text-pink-500 mb-4" />
                                    <h3 className="text-2xl font-bold">Tu Panel de Control</h3>
                                    <p className="text-gray-400">Gestiona todo desde un solo lugar</p>
                                    <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                            <div className="text-3xl font-bold text-pink-400">24</div>
                                            <div className="text-xs text-gray-300">Turnos Hoy</div>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                            <div className="text-3xl font-bold text-purple-400">$125k</div>
                                            <div className="text-xs text-gray-300">Ventas</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">Todo lo que necesitas para crecer</h2>
                        <p className="text-xl text-gray-600">Herramientas profesionales diseñadas específicamente para salones de belleza y peluquerías modernas.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                        {[
                            {
                                icon: Calendar,
                                title: "Gestión de Turnos",
                                description: "Calendario inteligente que organiza tus citas, evita superposiciones y reduce el ausentismo con recordatorios automáticos.",
                            },
                            {
                                icon: Scissors,
                                title: "Perfil Web Personalizado",
                                description: "Tu propia página web profesional donde las clientas pueden ver tus trabajos y reservar online 24/7 sin llamarte.",
                            },
                            {
                                icon: Users,
                                title: "CRM de Clientes",
                                description: "Conoce a tus clientas. Historial de servicios, preferencias, cumpleaños y datos de contacto para fidelizarlas.",
                            },
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                                <div className="h-14 w-14 rounded-2xl bg-pink-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="h-7 w-7 text-pink-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-900/20 via-gray-900 to-gray-900"></div>
                <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
                    <h2 className="text-3xl lg:text-5xl font-bold">¿Lista para llevar tu salón al siguiente nivel?</h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">Únete a cientos de profesionales que ya gestionan su negocio con MujerApp.</p>
                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            className="text-lg px-10 py-7 bg-white text-gray-900 hover:bg-gray-100 shadow-xl rounded-full font-bold"
                            onClick={() => router.push('/business/register')}
                        >
                            Comenzar Prueba Gratis
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
