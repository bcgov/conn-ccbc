# -*- coding: utf-8 -*-
from dag_configuration import default_dag_args
from trigger_k8s_cronjob import trigger_k8s_cronjob
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta
from airflow import DAG
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

TWO_DAYS_AGO = datetime.now() - timedelta(days=2)

DEPLOY_DB_DAG_NAME = 'cas_cif_deploy_db'

cif_namespace = os.getenv('CIF_NAMESPACE')

default_args = {
    **default_dag_args,
    'start_date': TWO_DAYS_AGO
}

"""
###############################################################################
#                                                                             #
# DAG triggering cron jobs to setup the cif database                       #
#                                                                             #
###############################################################################
"""


deploy_db_dag = DAG(DEPLOY_DB_DAG_NAME, schedule_interval=None,
    default_args=default_args, is_paused_upon_creation=False)

cif_db_init = PythonOperator(
    python_callable=trigger_k8s_cronjob,
    task_id='cif_db_init',
    op_args=['cas-cif-db-init', cif_namespace],
    dag=deploy_db_dag)

cif_app_schema = PythonOperator(
    python_callable=trigger_k8s_cronjob,
    task_id='cif_app_schema',
    op_args=['cas-cif-deploy-data', cif_namespace],
    dag=deploy_db_dag)

cif_import_operator = PythonOperator(
    python_callable=trigger_k8s_cronjob,
    task_id='cif_import_operator',
    op_args=['cas-cif-swrs-operator-import', cif_namespace],
    dag=deploy_db_dag)


cif_db_init >> cif_app_schema >> cif_import_operator
