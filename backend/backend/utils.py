import asyncio

def run_as_sync(f):
    def inner(*args, **kwargs):
        try: 
            loop = asyncio.get_event_loop()
        except:
            loop = asyncio.new_event_loop()
        return loop.run_until_complete(f(*args, **kwargs))
    return inner

