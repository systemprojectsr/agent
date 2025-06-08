from django import forms

class ContactForm(forms.Form):
    name = forms.CharField(label='ФИО', max_length=50, widget=forms.TextInput(attrs={'placeholder': 'ФИО'}))
    phone = forms.CharField(label='Номер телефона', max_length=15, widget=forms.TextInput(attrs={'placeholder': 'Номер телефона'}))
    email_address = forms.EmailField(label='Ваш email', max_length=150, widget=forms.EmailInput(attrs={'placeholder': 'Электронная почта'}))
    birth_date = forms.DateField(label='Дата рождения', widget=forms.DateInput(attrs={'type': 'date', 'placeholder': 'Дата рождения'}))
    job = forms.CharField(label='Вид услуги', max_length=50, widget=forms.TextInput(attrs={'placeholder': 'Вид услуги'}))
    experience = forms.CharField(label='Опыт работы', widget=forms.Textarea(attrs={'placeholder': 'Опыт работы', 'rows': 3}))
    about_me = forms.CharField(label='О себе', widget=forms.Textarea(attrs={'placeholder': 'Информация о себе', 'rows': 4}))
    photo = forms.ImageField(label='Фото', required=False)
