def after_get_user_context(context):
    if 'languages' in context:
        allowed_languages = ['English', 'Greek']  # Add any other allowed languages here
        context['languages'] = [lang for lang in context['languages'] if lang in allowed_languages]
