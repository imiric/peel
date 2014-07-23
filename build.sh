#!/bin/bash

CWD=$(pwd)
DOWNLOAD_DIR=./src

# Clean any previous leftovers
rm -rf "${DOWNLOAD_DIR}"
mkdir "${DOWNLOAD_DIR}"

# test for git and hg commands
for cmd in git hg; do
    command -v ${cmd} >/dev/null || { echo "sh: command not found: ${cmd}"; exit 1; }
done

# Upgrade pip to a version that supports --no-use-wheel
pip --version | awk '{ gsub(/\./, ""); if ($2<154) print "pip install --upgrade pip" }' | bash
# Download all packages to ./src (default)
pip install --download "${DOWNLOAD_DIR}" --no-use-wheel -r requirements.txt

cd "${DOWNLOAD_DIR}"
# Unpack packages
ls *.tar.gz | xargs -I{} tar xzf {}

# Move all dependencies to the project root, so they're available to GAE.
for dir in $(find . -maxdepth 1 -mindepth 1 -type d); do
    toplevel=$(find ${dir} -name top_level.txt -type f -exec cat {} \;)
    if [ -n "${toplevel}" ]; then
        dep="${dir}/${toplevel}"
        if [ -d "${dep}" ]; then
            # There's a directory with the top_level name.
            mv "${dep}" "${CWD}"
        elif [ -f "${dep}.py" ]; then
            # There's a Python module with the top_level name.
            mv "${dep}.py" "${CWD}"
        fi
    else
        # Parse setup.py to get the module name(s)
        modules=$(grep py_modules ${dir}/setup.py 2>/dev/null | sed -e 's:.*\[\(.*\)\].*:\1:g' -e 's:[",]: :g')
        for mod in "${modules}"; do
            mod=$(echo "${mod}" | tr -d ' ')
            file="${dir}/${mod}.py"
            if [ -f "${file}" ]; then
                mv "${file}" ${CWD}
            fi
        done
    fi
done

cd "${CWD}"
rm -rf "${DOWNLOAD_DIR}"

echo "Now run:
./manage.py runserver

To launch this app. If you want access to django /admin, run also:
./manage.py createsuperuser

And then login in <your_app_ip>/admin, probably http://127.0.0.1:8000/admin"
