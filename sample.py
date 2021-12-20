import random

for i in range(1, 31):
    print(f"INSERT INTO HEALTHDATA VALUES (HEALTHID.NEXTVAL, 'dmsrn135', {random.randint(70, 90)}, {random.randint(110, 130)}, {random.randint(65, 80)}, {random.randint(97, 100)}, TO_DATE('2021/11/{i}', 'yyyy/mm/dd'));")