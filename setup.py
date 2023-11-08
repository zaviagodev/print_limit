from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in print_limit/__init__.py
from print_limit import __version__ as version

setup(
	name="print_limit",
	version=version,
	description="Limit the number of times a Role OR a user can perint a document.",
	author="Zaviago.ltd",
	author_email="john@zaviago.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
