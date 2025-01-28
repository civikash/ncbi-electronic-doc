from django import template

register = template.Library()

@register.filter
def range_filter(value):
    return range(1, value + 1)


@register.filter
def index(sequence, position):
    try:
        return sequence[position - 1]
    except (IndexError, TypeError):
        return ''