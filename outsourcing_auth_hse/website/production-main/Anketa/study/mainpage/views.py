from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from .forms import ContactForm
from django.core.mail import send_mail, BadHeaderError
from django.http import HttpResponse
from django.views.generic import TemplateView



class HomeView(TemplateView):
    template_name = 'mainpage/home.html'

# def contact(request):
#     if request.method == 'POST':
#         form = ContactForm(request.POST)
#         if form.is_valid():
#             subject = "Пробное сообщение"
#             body = {
#                 'first_name': form.cleaned_data['first_name'],
#                 'last_name': form.cleaned_data['last_name'],
#                 'email': form.cleaned_data['email_address'],
#                 'phone': form.cleaned_data['phone'],
#                 'experience': form.cleaned_data['experience'],
#             }
#             message = "\n".join(body.values())
#             try:
#                 send_mail(subject, message, 
#                           'admin@example.com',
#                           ['admin@example.com'])
#             except BadHeaderError:
#                 return HttpResponse('Найден некорректный заголовок')
#             return redirect("mainpage:homepage")

#     form = ContactForm()
#     return render(request, "mainpage/anketa.html", {'form': form})

class ContactView(TemplateView):
    template_name = "mainpage/anketa.html"  # Шаблон, который будет отображаться

    def get_context_data(self, **kwargs):
        """Добавляем форму в контекст при GET-запросе."""
        context = super().get_context_data(**kwargs)
        context['form'] = ContactForm()
        return context

    def post(self, request, *args, **kwargs):
        """Обрабатываем POST-запрос с отправкой формы."""
        form = ContactForm(request.POST)
        if form.is_valid():
            subject = "Пробное сообщение"
            body = {
                'name': form.cleaned_data['name'],
                'email': form.cleaned_data['email_address'],
                'phone': form.cleaned_data['phone'],
                'job': form.cleaned_data['job'],
                'about_me': form.cleaned_data['about_me'],
                'about_me': form.cleaned_data['about_me'],
            }
            message = "\n".join(body.values())

            try:
                send_mail(
                    subject,
                    message,
                    'admin@example.com',
                    ['admin@example.com']
                )
            except BadHeaderError:
                return HttpResponse('Найден некорректный заголовок')

            # Перенаправление на главную после успешной отправки
            return redirect(reverse_lazy("home"))

        # Если форма не валидна, отображаем её с ошибками
        return self.render_to_response({'form': form})