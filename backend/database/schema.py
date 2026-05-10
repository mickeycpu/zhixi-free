from database.client import supabase

def check_tables() -> bool:
    try:
        supabase.table("uploads").select("id").limit(1).execute()
        return True
    except Exception:
        return False
