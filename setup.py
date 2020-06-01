import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="spineapi",
    version="0.0.5",
    author="northfoxz",
    author_email="firstera15@gmail.com",
    description="Access your python functions through HTTP requests.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/northfoxz/spine-api",
    packages=setuptools.find_packages(),
    install_requires=[
        "python-socketio[client]"
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
)
