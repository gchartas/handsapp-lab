from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in handsapp_lab/__init__.py
from handsapp_lab import __version__ as version

setup(
	name="handsapp_lab",
	version=version,
	description="Laboratory Information Management",
	author="George Chartas",
	author_email="gchartas@englandgr.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
