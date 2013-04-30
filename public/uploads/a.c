#include "stdio.h"

int main(int argc, char const *argv[])
{
  char *a = "miao";
  char *b = "bau";
  sprintf("%s%s", a, b);
  printf("%s\n", a);
  return 0;
}