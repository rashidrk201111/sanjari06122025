import os
from pathlib import Path
from urllib.parse import parse_qs, urlparse, unquote
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / '.env'
if ENV_PATH.exists():
    load_dotenv(str(ENV_PATH), override=False)
else:
    load_dotenv(str(BASE_DIR.parent / '.env'), override=False)

def bool_from_env(value, default=False):
    if value is None:
        return default
    return str(value).strip().lower() in ('1', 'true', 'yes', 'on')

def parse_database_url(url):
    if not url:
        return {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / '..' / 'db.sqlite3',
        }

    parsed = urlparse(url)
    scheme = parsed.scheme
    if scheme in ('postgres', 'postgresql'):
        engine = 'django.db.backends.postgresql'
    elif scheme == 'mysql':
        engine = 'django.db.backends.mysql'
    elif scheme == 'sqlite':
        engine = 'django.db.backends.sqlite3'
    else:
        raise ImproperlyConfigured(f'Unsupported DATABASE_URL scheme: {scheme}')

    if engine == 'django.db.backends.sqlite3':
        path = parsed.path
        if path in ('', '/'):  # sqlite:///:memory: or empty path
            return {
                'ENGINE': engine,
                'NAME': ':memory:',
            }
        if path.startswith('/'):
            path = path[1:]
        if not os.path.isabs(path):
            path = os.path.join(BASE_DIR, path)
        return {
            'ENGINE': engine,
            'NAME': path,
        }

    config = {
        'ENGINE': engine,
        'NAME': unquote(parsed.path[1:]) if parsed.path.startswith('/') else unquote(parsed.path),
        'USER': unquote(parsed.username or ''),
        'PASSWORD': unquote(parsed.password or ''),
        'HOST': unquote(parsed.hostname or ''),
        'PORT': parsed.port or '',
    }
    query = parse_qs(parsed.query)
    sslmode = query.get('sslmode', ['require'])[0]
    if sslmode:
        config['OPTIONS'] = {'sslmode': sslmode}
    return config

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise ImproperlyConfigured('DJANGO_SECRET_KEY must be set for production deployments')

DEBUG = bool_from_env(os.getenv('DEBUG', 'False'))

ALLOWED_HOSTS = [host.strip() for host in os.getenv('ALLOWED_HOSTS', '').split(',') if host.strip()]
if DEBUG and not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ['localhost', '127.0.0.1']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.forms',
    'rest_framework',
    'payments',
    'rest_framework.authtoken',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'project.wsgi.application'

if os.getenv('NODE_ENV') == 'production' and not os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': '/tmp/db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': parse_database_url(os.getenv('DATABASE_URL', f'sqlite:///{BASE_DIR / ".." / "db.sqlite3"}')),
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTHENTICATION_BACKENDS = [
    'payments.auth_backends.SupabaseAdminBackend',
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
MEDIA_URL = '/media/'
if os.getenv('NODE_ENV') == 'production':
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    MEDIA_ROOT = BASE_DIR / 'media'
else:
    STATIC_ROOT = BASE_DIR / '..' / 'staticfiles'
    MEDIA_ROOT = BASE_DIR / '..' / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Security
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = bool_from_env(os.getenv('SECURE_SSL_REDIRECT', 'True'))
SESSION_COOKIE_SECURE = bool_from_env(os.getenv('SESSION_COOKIE_SECURE', 'True'))
CSRF_COOKIE_SECURE = bool_from_env(os.getenv('CSRF_COOKIE_SECURE', 'True'))
SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '31536000') if not DEBUG else 0)
SECURE_HSTS_INCLUDE_SUBDOMAINS = bool_from_env(os.getenv('SECURE_HSTS_INCLUDE_SUBDOMAINS', 'True'))
SECURE_HSTS_PRELOAD = bool_from_env(os.getenv('SECURE_HSTS_PRELOAD', 'True'))
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

CORS_ALLOW_ALL_ORIGINS = bool_from_env(os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False'))
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv('CORS_ALLOWED_ORIGINS', '').split(',') if origin.strip()]
CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',') if origin.strip()]

for local_origin in (
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
):
    if local_origin not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(local_origin)
    if local_origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(local_origin)

# PhonePe V2 config (client credentials from Developer Settings)
PHONEPE_CLIENT_ID = os.getenv('PHONEPE_CLIENT_ID') or os.getenv('PHONEPE_MERCHANT_ID')
PHONEPE_CLIENT_SECRET = os.getenv('PHONEPE_CLIENT_SECRET') or os.getenv('PHONEPE_MERCHANT_SECRET')
PHONEPE_CLIENT_VERSION = os.getenv('PHONEPE_CLIENT_VERSION') or os.getenv('PHONEPE_SALT_INDEX', '1')
PHONEPE_SANDBOX = bool_from_env(os.getenv('PHONEPE_SANDBOX', 'False'))

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

FORM_RENDERER = 'django.forms.renderers.TemplatesSetting'

