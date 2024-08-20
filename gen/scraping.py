import time

from selenium import webdriver

from gen.env_loader import env_is_defined, env_setter, load


def setup():
    load()

    required_vars = [
        'GEN_LOGIN_URL',
        'GEN_PERSON_URL',
        'GEN_USERNAME',
        'GEN_PASSWORD',
    ]

    for index in required_vars:
        if not env_is_defined(index):
            value = input(f'\nset a value for {index}: ')
            env_setter(index, f'{str(value)}')


if __name__ == '__main__':

    setup()

    driver = webdriver.Firefox()

    driver.get('http://www.google.com/')

    time.sleep(5)   # Let the user actually see something!

    search_box = driver.find_element_by_name('q')

    search_box.send_keys('ChromeDriver')

    search_box.submit()

    time.sleep(5)   # Let the user actually see something!

    driver.quit()
