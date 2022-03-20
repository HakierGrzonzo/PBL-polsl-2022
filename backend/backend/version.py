from os.path import join
path = "/".join(__file__.split("/")[:-1])
version = "dev"
try:
    with open(join(path, ".version")) as f:
        version = f.read().strip()
except:
    print("Failed to get a version number")
