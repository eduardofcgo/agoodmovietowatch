#!/bin/sh

python download.py && python database.py && python stevenlu.py && python publish.py
