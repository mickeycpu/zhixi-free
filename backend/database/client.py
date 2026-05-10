from supabase import create_client, Client, SupabaseException

from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

_client: Client = None

def get_supabase() -> Client:
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _client

class LazyProxy:
    def __getattr__(self, name):
        return getattr(get_supabase(), name)

supabase = LazyProxy()
