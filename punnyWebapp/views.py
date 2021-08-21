from django.http.response import HttpResponseRedirect
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from random import choice
from django.core.paginator import Paginator, EmptyPage
from django.db import models
from django.db.models.functions import Cast
from django.urls import reverse
from django import forms
from django.views.decorators.cache import cache_control
import datetime


from .models import Pun

import json

class NewSearchForm(forms.Form):
    query_text = forms.CharField(required=True, min_length=3, max_length=20, widget=forms.TextInput(attrs={
        'class':'md:flex-1 sm:px-2 text-xl text-shadow-md w-full p-2 rounded-sm resize-y bg-yellow-100 dark:bg-gray-600 dark:text-yellow-300 focus:bg-yellow-200 dark:hover:border-yellow-400 dark:focus:bg-black-700 transform ease-in-out duration-500',
        'id':'searchBar',
        'name':"searchBar",
        'cols':"1",
        'rows':"1",
        'placeholder':"keywords here"
    }))

    def __init__(self, *args, **kwargs):
        super(NewSearchForm, self).__init__(*args, **kwargs)
        self.fields['query_text'].label = ""

def home(request):

    today = datetime.date.today() # date representing today's date
    same_day_puns = Pun.objects.filter(pub_date__gt=today) # filter objects created today

    if len(same_day_puns) == 0:
        context = {
            "top_pun": False,
            "form": NewSearchForm(),
        }
        return render(request, 'punnyWebapp/home.html', context)

    top_pun_of_the_day = same_day_puns.order_by('-score')[0]
    print(top_pun_of_the_day)

    pun_content = top_pun_of_the_day.pun_content["content"]

    context = {
        "top_pun": pun_content,
        "pun_id": top_pun_of_the_day.pk,
        "form": NewSearchForm(),
    }
    return render(request, 'punnyWebapp/home.html', context)

def random_link(request):
    random_pun_object = choice(Pun.objects.all())

    return HttpResponseRedirect(reverse('pun', args=[random_pun_object.id]))

def pun(request, pun_id):

    try:
        pun_object = Pun.objects.get(id=pun_id)
    except:
        return HttpResponse("it didn't work...")

    print("--------------------------------")
    print("found object")
    print(pun_object)
    print("--------------------------------")

    JSON_object = pun_object.pun_content

    # generate the pun and attach <a> tags with links to explanations
    content_string = JSON_object["content"]
    string_coordinates_list = []
    explanation_list = []

    for key, value in JSON_object["explanation"].items():

        # for pun content
        if (value["link"] == True):
            a = [value["stringStartPosition"], value["stringEndPosition"], value["id"]]
            string_coordinates_list.append(a)

            # for explanation content
            substring_in_explanation = False

            if (content_string[value["stringStartPosition"] : value["stringEndPosition"]] in value["explanationContent"]):
                substring_in_explanation = True
            b = [value["id"], value["explanationContent"], substring_in_explanation, value["stringStartPosition"], value["stringEndPosition"]]
            explanation_list.append(b)

        else:
            b = [value["id"], value["explanationContent"], False, 0, 0]
            explanation_list.append(b)

    new_content_string = content_string

    print(string_coordinates_list)
    if (len(string_coordinates_list) > 0):
        string_coordinates_list.sort(reverse=True)
        print(type(string_coordinates_list[0][0]))
        print(string_coordinates_list[0][0], string_coordinates_list[0][1])

        for i in range(len(string_coordinates_list)):
            text_to_keep = content_string[string_coordinates_list[i][0]: string_coordinates_list[i][1]]
            newStringToInsert = f'<span class="text-white dark:text-yellow-400 font-bold"><a id="explanation-{string_coordinates_list[i][2]}-link" class="cursor-pointer js-explanation-word" @click="selected = 1;">{text_to_keep}</a></span>'
            new_content_string = new_content_string[0: string_coordinates_list[i][0]] + newStringToInsert + new_content_string[string_coordinates_list[i][1]:]

    # generate the explanation paragraphs with correct id's

    explanation_list.sort()

    explanation_content = ""

    for explanation in explanation_list:
        content_to_insert = explanation[1]
        if explanation[2] == True:
            word_to_replace = content_string[explanation[3]:explanation[4]]
            formatted_string = '<span class="text-white dark:text-yellow-400 font-bold">' + word_to_replace + '</span>'
            content_to_insert = content_to_insert.replace(word_to_replace, formatted_string)
        explanation_content = explanation_content + f'<p style="white-space: pre-wrap;" id="explanation-{explanation[0]}" class="mt-10"></br>{content_to_insert}</br></p>'

    context = {
        "pun": pun_object,
        "formatted_pun": new_content_string,
        "explanation_content": explanation_content,
    }
    return render(request, 'punnyWebapp/index.html', context)

def vote(request):
    if request.method == "POST":
        post_data = json.loads(request.body.decode("utf-8"))
        direction = post_data.get('direction')
        button = post_data.get('button')
        pkForTesting = post_data.get('pkForTesting')

        try:
            pun_object = Pun.objects.get(id=pkForTesting)
        except:
            return HttpResponse("it didn't work...")

        # increase vote count
        if (direction == "up"):
            if button == "reviewButtonGood-value":
                pun_object.good_votes = pun_object.good_votes + 1
            elif button == "reviewButtonOk-value":
                pun_object.ok_votes = pun_object.ok_votes + 1
            elif button == "reviewButtonBad-value":
                pun_object.bad_votes = pun_object.bad_votes + 1
            else:
                print("Error - button not detected")
            pun_object.save()
        # decrease vote count
        elif (direction == "down"):
            if button == "reviewButtonGood-value":
                pun_object.good_votes = pun_object.good_votes - 1
            elif button == "reviewButtonOk-value":
                pun_object.ok_votes = pun_object.ok_votes - 1
            elif button == "reviewButtonBad-value":
                pun_object.bad_votes = pun_object.bad_votes - 1
            else:
                print("Error - button not detected")
            pun_object.save()

        return HttpResponse("Vote cast!")

def create(request):

    return render(request, 'punnyWebapp/create.html')

def upload(request):
    if request.method == "POST":

        print("----------------------")
        print("Request received of...")
        print(request)
        print("----------------------")

        post_data = json.loads(request.body.decode("utf-8"))
        print("----------------------")
        print("Post data received of...")
        print(post_data)
        print("----------------------")

        new_pun = Pun(
            pun_content=post_data.get('punJSON'),
        )
        new_pun.save()

        new_pun_id = str(new_pun.id)

        return HttpResponse(new_pun_id)

@cache_control(no_cache=True, must_revalidate=True)
def new_link(request):
    if request.method == "GET":

        print("----------------------")
        print("Request received of...")
        #print(request)
        print("----------------------")

        #post_data = json.loads(request.body.decode("utf-8"))
        print("----------------------")
        print("Post data received of...")
        #print(post_data)
        print("----------------------")

        new_pun = choice(Pun.objects.all())

        new_pun_id = new_pun.id

        return JsonResponse({"link": new_pun_id}, status = 201)

def search_results(request):

    print("made it to the search results view")

    query = request.GET.get("q", "")
    print("found query of...")
    print(query)

    if query == "":
        # Isolate the data from the 'cleaned' version of form data
        query_text = request.GET.get("query_text", "")
        print("-----------------------------------------------------------------")
        print("found query text of")
        print(query_text)
        print("-----------------------------------------------------------------")
    else:
        query_text = query[0]
        print("-----------------------------------------------------------------")
        print("found query text of")
        print(query_text)
        print("-----------------------------------------------------------------")

    if (request.method == 'GET'):

        result = Pun.objects.annotate(content=Cast('pun_content__content', models.TextField()),).filter(content__contains=query_text).order_by('-score')
        print("found results of the following:")
        print(result)

        #result.order_by('get_score')
        #print(result)

        #result = Pun.objects.get(pun_content__contains=query)#.order_by('get_score')

        if (len(result) > 0):

            for pun in result:

                ALLOWED_LENGTH_OF_PUN = 50
                pun.pun_shortened = (pun.pun_content["content"][:ALLOWED_LENGTH_OF_PUN] + '...') if len(pun.pun_content["content"]) > ALLOWED_LENGTH_OF_PUN else pun.pun_content["content"]

            p = Paginator(result, 5) # Show 10 results per page
            page_num = request.GET.get('page', 1)

            try:
                page = p.page(page_num)
            except EmptyPage:
                page = p.page(1)

            context = {
                "puns": page,
                "search": True,
            }

            print("THIS SHOULD REDIRECT THE PAGE!")

            return render(request, 'punnyWebapp/search.html', context)

        else:
            # no results found
            context = {
                "query_text": query_text,
                "form": NewSearchForm(),
            }

            return render(request, 'punnyWebapp/no_results.html', context)

    return render(request, 'punnyWebapp/home.html')