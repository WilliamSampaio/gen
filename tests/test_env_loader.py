import secrets
from os import environ

import pytest

from gen.env_loader import env_is_defined, env_setter, load


def test_load():
    env_indexes = [
        'GEN_LOGIN_URL',
        'GEN_PERSON_URL',
        'GEN_USERNAME',
        'GEN_PASSWORD',
        'GEN_SQLALCHEMY_DATABASE_URI',
    ]

    load('.env.test')

    for index in env_indexes:
        assert index in environ


def test_load_env_does_not_exist():
    with pytest.raises(Exception):
        load('.env.' + secrets.token_hex(nbytes=8))


def test_env_is_defined():
    load('.env.test')

    assert env_is_defined('XYZ_' + secrets.token_hex(nbytes=8)) is False
    assert env_is_defined('GEN_SQLALCHEMY_DATABASE_URI') is True


def test_env_setter():
    assert env_setter('XYZ_' + secrets.token_hex(nbytes=8), 'ABC') is None


def test_env_setter_exception():
    with pytest.raises(Exception):
        env_setter(999, 'ABC')
