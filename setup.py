from setuptools import find_packages,setup
from typing import List

def get_requirements()->List[str]:
    '''
    This function will return list of requiremnts
    '''
    requirement_lst:List[str]=[]
    try:
        with open('requirements.txt','r') as file:
            lines=file.readlines()
            ##process each line
            for line in lines:
                requirement=line.strip()
                ##ignore empty lines and -e.
                if requirement and requirement!='-e .':
                    requirement_lst.append(requirement)
    except FileNotFoundError:
        print("requirements.txt file not found")

    return requirement_lst

setup(
    name="NetworkSecurity",
    version="0.0.1",
    author="Sahil",
    author_email="sahilpatil009@gmail.com",
    packages=find_packages(),
    install_requires=get_requirements()
)

##-e . is refering to setup.py file . when we run requirements . txt a new folder is created which has packages
## when our complete project is done after that we can use this os that all project is done and we have all packages . this is basically 
##used to deploy on cloud or to deploy as pypy