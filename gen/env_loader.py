from os import environ, getcwd, path

from dotenv import load_dotenv


def load():
    env = path.join(getcwd(), '.env')
    if not path.exists(env):
        raise Exception('Error! .env does not exsit.')
    load_dotenv(dotenv_path=env)


def env_is_defined(index: str):
    if index not in environ:
        return False
    return True


def env_setter(index: str, value):
    try:
        environ[index] = value
    except Exception:
        raise Exception('Error! Failure when defining env var.')
