"use client";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";
import { useReducer, useCallback } from "react";
import { useForm, FieldError } from "react-hook-form";

type FormState = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
};

type FormAction =
  | { type: "SUBMIT" }
  | { type: "SUCCESS" }
  | { type: "ERROR"; errorMessage: string }
  | { type: "RESET" };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SUBMIT":
      return { ...state, isLoading: true, isSuccess: false, isError: false };
    case "SUCCESS":
      return { ...state, isLoading: false, isSuccess: true, isError: false };
    case "ERROR":
      return { ...state, isLoading: false, isError: true, errorMessage: action.errorMessage };
    case "RESET":
      return { isLoading: false, isSuccess: false, isError: false, errorMessage: undefined };
    default:
      return state;
  }
};

export function ContactSection() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [state, dispatch] = useReducer(formReducer, {
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const onSubmit = useCallback(async (data: any) => {
    dispatch({ type: "SUBMIT" });
    try {
      // Simulated API call (replace with your actual endpoint)
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar a mensagem.");
      }

      const result = await response.json();
      console.log("Dados enviados:", result);
      dispatch({ type: "SUCCESS" });
      reset();
      setTimeout(() => dispatch({ type: "RESET" }), 3000);
    } catch (error) {
      dispatch({
        type: "ERROR",
        errorMessage: error instanceof Error ? error.message : "Erro ao enviar a mensagem. Tente novamente.",
      });
      setTimeout(() => dispatch({ type: "RESET" }), 3000);
    }
  }, [reset]);

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Fale Connosco</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Tem dúvidas ou sugestões? Entre em contacto com a nossa equipa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Informações de Contacto</h3>
              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                      <method.icon size={20} />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{method.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{method.description}</p>
                      {method.links && (
                        <div className="mt-2 space-y-1">
                          {method.links.map((link, i) => (
                            <a
                              key={i}
                              href={link.href}
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {link.text}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Horário de Funcionamento</h3>
              <ul className="space-y-3">
                {businessHours.map((hour, index) => (
                  <li key={index} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{hour.day}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{hour.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Envie-nos uma Mensagem</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name", {
                      required: "Campo obrigatório",
                      minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" },
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Seu nome"
                    aria-invalid={errors.name ? "true" : "false"}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {typeof errors.name.message === "string" ? errors.name.message : "Erro no nome"}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Campo obrigatório",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email inválido",
                      },
                    })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="seu@email.com"
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {typeof errors.email.message === "string" ? errors.email.message : "Erro no email"}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assunto *
                </label>
                <input
                  id="subject"
                  type="text"
                  {...register("subject", {
                    required: "Campo obrigatório",
                    minLength: { value: 3, message: "Assunto deve ter pelo menos 3 caracteres" },
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Qual o assunto?"
                  aria-invalid={errors.subject ? "true" : "false"}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {typeof errors.subject.message === "string" ? errors.subject.message : "Erro no assunto"}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mensagem *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  {...register("message", {
                    required: "Campo obrigatório",
                    minLength: { value: 10, message: "Mensagem deve ter pelo menos 10 caracteres" },
                  })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Escreva a sua mensagem..."
                  aria-invalid={errors.message ? "true" : "false"}
                ></textarea>
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {typeof errors.message.message === "string" ? errors.message.message : "Erro na mensagem"}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={state.isLoading}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {state.isLoading ? (
                    <>
                      <FiLoader className="animate-spin mr-2" size={18} />
                      Enviando...
                    </>
                  ) : state.isSuccess ? (
                    <>
                      Enviado com Sucesso <FiCheckCircle className="ml-2" />
                    </>
                  ) : state.isError ? (
                    <>
                      Erro <FiAlertCircle className="ml-2" />
                    </>
                  ) : (
                    <>
                      Enviar Mensagem <FiSend className="ml-2" />
                    </>
                  )}
                </button>
                {(state.isSuccess || state.isError) && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400" role="status">
                    {state.isSuccess
                      ? "Mensagem enviada com sucesso!"
                      : state.errorMessage}
                  </p>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const contactMethods = [
  {
    icon: FiMail,
    title: "Email",
    description: "Envie-nos um email e responderemos o mais rápido possível.",
    links: [
      { text: "suporte@pms.com", href: "mailto:suporte@pms.com" },
      { text: "comercial@pms.com", href: "mailto:comercial@pms.com" },
    ],
  },
  {
    icon: FiPhone,
    title: "Telefone",
    description: "Disponível durante o horário comercial.",
    links: [
      { text: "+351 123 456 789", href: "tel:+351123456789" },
      { text: "+351 987 654 321", href: "tel:+351987654321" },
    ],
  },
  {
    icon: FiMapPin,
    title: "Escritório",
    description: "Visite-nos no nosso escritório em Lisboa.",
    links: [
      { text: "Av. da Liberdade, 100, 1250-145 Lisboa", href: "https://maps.google.com" },
    ],
  },
];

const businessHours = [
  { day: "Segunda - Sexta", time: "09:00 - 18:00" },
  { day: "Sábado", time: "10:00 - 14:00" },
  { day: "Domingo", time: "Fechado" },
];